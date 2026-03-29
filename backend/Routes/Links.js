import express from 'express';
const router = express.Router();
import crypto from 'crypto';
import User from '../Schema/UserSchema.js'; 
import  Authenticate  from '../Middleware/Authenticate.js'; 
import {nanoid} from 'nanoid';

// Project's backend base URL (update this when deployed)
const isProd = process.env.NODE_ENV === "production";
const BASE_BACKEND_URL = isProd ? 'https://link-shortener-backend-xf73.onrender.com/' : 'http://localhost:3000/';

router.post('/create-link', Authenticate, async (req, res) => {

    try {
        const { destinationUrl, remarks, expiration } = req.body;

        if (!destinationUrl) {
            return res.status(400).json({ msg: 'Destination URL is required.' });
        }

        const userId = req.user.id; 

        
        const hash = crypto.createHash('md5').update(destinationUrl).digest('hex').slice(0, 8); 

        const shortUrl = `${BASE_BACKEND_URL}${hash}`;   
        const currentDate = new Date();
        const expirationDate = expiration ? new Date(expiration) : null;

        const status = expirationDate && expirationDate < currentDate ? 'inactive' : 'active';

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({msg: 'User not found.' });
        }

        const existingLink = user.links.find(
          link => link.originalUrl === destinationUrl
        );

        if (existingLink) {
          return res.status(200).json({
            msg: "Link already exists",
            link: existingLink
          });
        }

        user.links.push({
            originalUrl: destinationUrl,
            shortUrl: shortUrl,
            shortCode: hash,
            expirationDate: expirationDate,
            dateCreated: currentDate.toDateString(),
            timeCreated: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            remark: remarks || '',
            clicks: 0,
        });

        await user.save(); 

        res.status(200).json({ msg: 'Short link created successfully.', shortUrl, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
});

//===========get all links for authenticated user=====================
router.get('/all-links', Authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        res.status(200).json(user.links);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
});

//===================delete link=======================
router.delete('/:linkId', Authenticate, async (req, res) => {
    const { linkId } = req.params;

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const linkIndex = user.links.findIndex(link => link._id.toString() === linkId);

        if (linkIndex === -1) {
            return res.status(404).json({ message: 'Link not found' });
        }

        user.links.splice(linkIndex, 1); 
        await user.save();

        res.status(200).json({ message: 'Link deleted successfully' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ==================fetch link thru id =======================
router.get('/:linkId', Authenticate,  async (req, res) => {
  const { linkId } = req.params;

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const link = user.links.id(linkId); 
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.status(200).json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ==================Update link route===============================
router.put('/:linkId', Authenticate, async (req, res) => {
    try {
        const { destinationUrl, remarks, expiration } = req.body;
        const { linkId } = req.params;
    
        if (!destinationUrl) {
            return res.status(400).json({ msg: 'Destination URL is required.' });
        }

        const userId = req.user.id;

        const hash = crypto.createHash('md5').update(destinationUrl).digest('hex').slice(0, 8); 
        const shortUrl = `${BASE_BACKEND_URL}/${hash}`;

        const currentDate = new Date();
        const expirationDate = expiration ? new Date(expiration) : null;     
      
        const status = expirationDate && expirationDate < currentDate ? 'inactive' : 'active';
       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Find the link by its ID in the user's links array
        const linkIndex = user.links.findIndex(link => link._id.toString() === linkId);
        if (linkIndex === -1) {
            return res.status(404).json({ msg: 'Link not found.' });
        }

        user.links[linkIndex].originalUrl = destinationUrl;
        user.links[linkIndex].shortUrl = shortUrl;
        user.links[linkIndex].shortCode = hash;
        user.links[linkIndex].expirationDate = expirationDate;
        user.links[linkIndex].status = status;
        user.links[linkIndex].remark = remarks || '';
        user.links[linkIndex].dateCreated = currentDate.toDateString();
        user.links[linkIndex].timeCreated = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        await user.save();

        res.status(200).json({ msg: 'Link updated successfully.', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
});


// router.put('/:linkId', Authenticate, async (req, res) => {
//     console.log('INTO-----------')
//   const { linkId } = req.params;
//   const userId = req.user.id;
//   const { destinationUrl, remarks, expirationDate } = req.body;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     const link = user.links.id(linkId); // Find the link by its id
//     if (!link) {
//       return res.status(404).json({ msg: 'Link not found' });
//     }

//     // Update the link fields
//     link.originalUrl = destinationUrl || link.originalUrl;
//     link.remark = remarks || link.remark;
//     link.expirationDate = expirationDate || link.expirationDate;

//     await user.save(); // Save the updated user document

//     res.status(200).json({ msg: 'Link updated successfully', link });
//   } catch (error) {
//     console.error('Error updating link:', error);
//     res.status(500).json({ msg: 'Error updating link', error });
//   }
// });

export default router;
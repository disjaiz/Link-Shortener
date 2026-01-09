import express from 'express';
const router = express.Router();
import crypto from 'crypto'; // For hashing the URL
import User from '../Schema/UserSchema.js'; // Import User model
import  Authenticate  from '../Middleware/Authenticate.js'; // Middleware for authentication
import {nanoid} from 'nanoid';

// Project's backend base URL (update this when deployed)
const BASE_BACKEND_URL = process.env.BASE_BACKEND_URL;

router.post('/create-link', Authenticate, async (req, res) => {

    try {
        const { destinationUrl, remarks, expiration } = req.body;

        if (!destinationUrl) {
            return res.status(400).json({ msg: 'Destination URL is required.' });
        }

        const userId = req.user.id; // Get authenticated user ID from middleware

        // Hash the URL to generate a unique short code
        const hash = crypto.createHash('md5').update(destinationUrl).digest('hex').slice(0, 8); // Short 8-char hash

        console.log("destinationUrl- ", destinationUrl)
        console.log("hash- " , hash)


        const shortUrl = `${BASE_BACKEND_URL}${hash}`;   // Create shortened URL
        const currentDate = new Date();
        const expirationDate = expiration ? new Date(expiration) : null;

        // Determine status based on expiration date
        const status = expirationDate && expirationDate < currentDate ? 'inactive' : 'active';

        // Find the user and update their links array
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({msg: 'User not found.' });
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

        await user.save(); // Save the user with the new link

        res.status(200).json({ msg: 'Short link created successfully.', shortUrl, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
});

// Route to get all links for authenticated user
router.get('/all-links', Authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Find user and return their links
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
        // Find the user and remove the link with the given ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const linkIndex = user.links.findIndex(link => link._id.toString() === linkId);

        if (linkIndex === -1) {
            return res.status(404).json({ message: 'Link not found' });
        }

        user.links.splice(linkIndex, 1); // Remove the link from the array
        await user.save(); // Save the updated user document

        res.status(200).json({ message: 'Link deleted successfully' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ===============================fetch link thru id =======================
router.get('/:linkId', Authenticate,  async (req, res) => {
  const { linkId } = req.params;

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the link by linkId within the links array
    const link = user.links.id(linkId); // Mongoose's `id` method finds a subdocument by ID
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Respond with the link data
    res.status(200).json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===================Update link route===============================
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


router.put('/:linkId', Authenticate, async (req, res) => {
    try {
        const { destinationUrl, remarks, expiration } = req.body;
        const { linkId } = req.params;
    
        if (!destinationUrl) {
            return res.status(400).json({ msg: 'Destination URL is required.' });
        }

        const userId = req.user.id; // Get authenticated user ID from middleware

        // Hash the URL to generate a unique short code
        const hash = crypto.createHash('md5').update(destinationUrl).digest('hex').slice(0, 8); // Short 8-char hash
        const shortUrl = `${BASE_BACKEND_URL}/${hash}`; // Create shortened URL

        const currentDate = new Date();
        const expirationDate = expiration ? new Date(expiration) : null;     
      

        // Determine status based on expiration date
        const status = expirationDate && expirationDate < currentDate ? 'inactive' : 'active';
       


        // Find the user and the link to update
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Find the link by its ID in the user's links array
        const linkIndex = user.links.findIndex(link => link._id.toString() === linkId);
        if (linkIndex === -1) {
            return res.status(404).json({ msg: 'Link not found.' });
        }

        // Update the link with new data
        user.links[linkIndex].originalUrl = destinationUrl;
        user.links[linkIndex].shortUrl = shortUrl;
        user.links[linkIndex].shortCode = hash;
        user.links[linkIndex].expirationDate = expirationDate;
        user.links[linkIndex].status = status;
        user.links[linkIndex].remark = remarks || '';
        user.links[linkIndex].dateCreated = currentDate.toDateString();
        user.links[linkIndex].timeCreated = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        await user.save(); // Save the user with the updated link

        res.status(200).json({ msg: 'Link updated successfully.', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
});

// ===================Check if shortUrl exists===============================
router.get("/check", async (req, res) => {
  const { shortUrl } = req.query;
  console.log("url geot " , shortUrl)

  const existing = await User.findOne({ "links.shortUrl": shortUrl });

  res.json({ exists: !!existing });
});


export default router;
import {useState, useEffect, useRef}from 'react'
import style from './Links.module.css'
import { format, parse } from 'date-fns';
import copy from '../images/copy.png';
import del from '../images/delete.png';
import edit from '../images/pen.png';
import cross from '../images/cross.png';
import close from '../images/close.png';
import { deleteLink } from '../FetchMaker';
import no_data_img from '../images/no_data.png';
import PropTypes from 'prop-types';



const BACKEND_URL = "http://localhost:3000/";



function Links({ links, refreshLinks }) {
  const formRef = useRef(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 7;
  const [totalPages, setTotalPages] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expiration, setExpiration] = useState(true);

  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [formData, setFormData] = useState({
      destinationUrl: "",
      remarks: "",
      expiration: "",
  });


  // useEffect(() => {
  //     fetchLinks();
  // }, []);

  // const fetchLinks = async () => {
  //     try {
  //         const response = await fetch('http://localhost:3000/links/all-links', {
  //             method: 'GET',
  //             credentials: 'include', // Ensures cookies are sent
  //         });
  //         const allLinks = await response.json();
  //         setLinks(allLinks);      
  //         console.log(allLinks)
  //     } catch (error) {
  //         console.error('Error fetching links:', error);
  //     }
  // };

  useEffect(() => {
    if (links.length > 0) {
      const pages = Math.ceil(links.length / linksPerPage);
      setTotalPages(pages);
    } else {
      setTotalPages(0);
    }
  }, [links, linksPerPage]);

  const handleCopy = (Url) => {
      navigator.clipboard.writeText(Url);
      console.log('Copied to clipboard!');
  };

  const handleEdit =async (id) => {
    setSelectedLinkId(id);
      try {
        const response =await fetch(`http://localhost:3000/links/${id}`, {
          method: 'GET',
          credentials: 'include', 
      });
        const link = await response.json();
        setFormData({
          destinationUrl: link.originalUrl || "",
          remarks: link.remark || "",
          expiration: link.expirationDate || "",
        });
       
        setIsEditModalOpen(true)
      
      } catch (error) {
        console.log('Error fetching link', error);
      }
     
  };

  const handleDelete =  (id) => {
    setSelectedLinkId(id);
    setIsDeleteModalOpen(true)
  };
  const handleDeleteCloseModal = () => {
    setIsDeleteModalOpen(false);
  };
  const handleConfirmDelete = async() => {
    try {
          const response = await deleteLink(selectedLinkId);
          if (response.status === 200) {
              console.log('Link deleted successfully!');
              refreshLinks();
          } else {
              console.log('Error deleting link.');
          }
      } catch (error) {
          console.error('Error deleting link:', error);
      }
    console.log("Link deleted!");
    setIsDeleteModalOpen(false);
  };

  // Pagination logic
  const indexOfLastLink = currentPage * linksPerPage;
  const indexOfFirstLink = indexOfLastLink - linksPerPage;
  // const currentLinks = links.slice(indexOfFirstLink, indexOfLastLink);
  const currentLinks = Array.isArray(links) ? links.slice(indexOfFirstLink, indexOfLastLink) : [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setFormData({ destinationUrl: "", remarks: "", expiration: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const linkData = {
      ...formData,
      expiration: expiration ? formData.expiration : null, // Set expiration only if toggler is on
    };

    // console.log("Link Submitted:", linkData);
    try {
      const response = await fetch(`${BACKEND_URL}links/${selectedLinkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationUrl: linkData.destinationUrl,
          remarks:linkData.remarks,
          expiration: linkData.expiration,
        }),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.status === 200) {
        console.log('link updated succcessfully');
        await refreshLinks();   // 🔥 refresh links
        handleClear();
        setIsEditModalOpen(false);
      }                                       
      else if (response.status === 400) {
        console.log(data.msg);
        console.log(data);
      }                                     
      else {
        console.log('Error adding data!');
        console.error(data);
      }

      } catch (error) {
        console.error('Error updating link:', error);
        console.log('Failed to update link');
      }
  };


  
// ===============================================================================================================================================
  return (
      <div className={style.container}>

        {currentLinks.length === 0 && (
           <img src={no_data_img} className={style.bgNoDataImg} alt="No Data" />
        )}


          <table className={style.table}>
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Original Link</th>
                      <th>Short Link</th>
                      <th>Remarks</th>
                      <th>Clicks</th>
                      <th>Status</th>
                      <th>Action</th>
                  </tr>
              </thead>

              <tbody>
                  {currentLinks.map((link, index) => (
                      <tr key={index}>
                          <td> {format(new Date(link.dateCreated), 'MMM dd, yyyy')}  {format(parse(link.timeCreated, 'hh:mm a', new Date()), 'HH:mm')}</td>
                          <td style={{ position: 'relative' }}> {link.originalUrl}
                             <button onClick={() => handleCopy(link.originalUrl)} style={{backgroundColor:"white" ,cursor: 'pointer', zIndex:'1000', top:'20px', right:'0', position:'absolute'}}>
                                <img src={copy} alt="copy" style={{height:'30px', width:'30px',}} />
                              </button>
                          </td>

                          <td style={{ position: 'relative' }}>
                              <a 
                                href={`${BACKEND_URL}${link.shortCode}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                > 
                                {BACKEND_URL}{link.shortCode}
                              </a>

                              <button
                               onClick={() => handleCopy(`${BACKEND_URL}${link.shortCode}`)} 
                               style={{backgroundColor:"white" ,cursor: 'pointer', zIndex:'1000', top:'20px', right:'0', position:'absolute'}}>
                                <img src={copy} alt="copy" style={{height:'30px', width:'30px',}} />
                              </button>
                          </td>

                          <td>{link.remark}</td>
                          <td>{link.clicks}</td>
                          <td>
                             <span className={`${style.statusCell} ${link.status === 'active' ? style.active : style.inactive}`}>
                              {link.status}
                             </span>
                         </td>
                          <td>  
                                <img src={edit} alt="edit" onClick={() => handleEdit(link._id)}/>
                                <img src={del} alt="del" onClick={() => handleDelete(link._id)} />
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* Pagination Controls */}
        <div  className={style.paginationContainer}>
              <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>


     {isDeleteModalOpen && (
        <>
         <div className={style.backdrop}></div> {/* Dimming effect */}
          <div className={style.modalContent}>
            <img src={cross} alt="cross" className={style.crossimg} onClick={() => setIsDeleteModalOpen(false)}/>
            <p>Are you sure, you want to remove it?</p>
            <div className={style.modalButtons}>
              <button className={style.noBtn} onClick={handleDeleteCloseModal}>
                No
              </button>
              <button className={style.yesBtn} onClick={handleConfirmDelete}>
                Yes
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isEditModalOpen && (
        <>
          <div className={style.backdrop}></div> {/* Dimming effect */}
          <div className={style.editmodalContent}>
            <p className={style.mHeading}>New Link</p>
            <img onClick={()=> setIsEditModalOpen(false)} src={close} className={style.closeimg}/>
            <form  ref={formRef}  onSubmit={handleUpdate}  className={style.form}>

              <label htmlFor="destinationUrl" >Destination Url <span style={{color: 'red'}}>*</span></label>
              <input 
              type="url" 
              name="destinationUrl" 
              placeholder="https://web.whatsapp.com/"
              value={formData.destinationUrl}
              onChange={handleChange}
              />

              <label htmlFor="remarks">Remarks<span style={{color: 'red'}}>*</span></label>
              <textarea 
              name="remarks"
              rows={5} 
              placeholder="Add remarks"
              value={formData.remarks}
              onChange={handleChange}
          />

              <div className={style.expirationBox}>
                <label htmlFor="expiration">Link Expiration </label>

                <div className={style.toggler}>   
                    <button 
                    type="button" 
                    className={style.switchStyle} 
                    style={{backgroundColor: expiration? '#3b82f6' : '#e5e7eb'}} 
                    onClick={() => setExpiration(!expiration)} 
                     >
               <div className={style.circleStyle} style={{ left: expiration ? '31px' : '5px'}} />
               </button>
          </div>

              </div>
              
              <input 
              type="datetime-local" 
              name="expiration" 
              value={formData.expiration}
              onChange={handleChange}
              // disabled={!expiration} 
              />
            </form>

            <div className={style.bottom}>
              <button className={style.clearBtn} onClick={handleClear}>Clear</button>
              <button className={style.createBtn} onClick={() => formRef.current.requestSubmit()}>Edit</button>
            </div>
          </div>
        </>
      )}

       </div>
          );
}

export default Links







import { ChevronLeft, ChevronRight } from 'lucide-react';


const SimplePagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <>
      {/* Left arrow */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
         className={style.arrowBtn}
      >
        <ChevronLeft style={{height: '15px', width:'15px'}} />
      </button>
      
          {/* Page number buttons logic */}
          {totalPages === 3 || totalPages === 4  || totalPages === 1 || totalPages === 2? (
        <>
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            className={`${style.pageBtn} ${currentPage === 1 ? 'active' : ''}`}
          >
            1
          </button>

          {/* Ellipsis */}
          <span className={style.ellipsis}>...</span>


          {/* Last page button */}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`${style.pageBtn} ${currentPage === totalPages ? 'active' : ''}`}
          >
            {totalPages}
          </button>
        </>
      ) : ( <>
         {/* First two pages */}
      <button
        onClick={() => onPageChange(1)}
        className={`${style.pageBtn} ${currentPage === 1 ? 'active' : ''}`}
      >
        1
      </button>
      <button
        onClick={() => onPageChange(2)}
        className={`${style.pageBtn} ${currentPage === 2 ? 'active' : ''}`}
      >
        2
      </button>

      {/* Current page indicator */}
      <span className={style.ellipsis}>...</span>

      {/* Last two pages */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        // className={`px-2 rounded ${currentPage === totalPages - 1 ? 'bg-blue-500 text-white' : ''}`}
        className={`${style.pageBtn} ${currentPage === totalPages - 1? 'active' : ''}`}
      >
        {totalPages - 1}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        // className={`px-2 rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : ''}`}
        className={`${style.pageBtn} ${currentPage === totalPages ? 'active' : ''}`}
      >
        {totalPages}
      </button>

      </> )}

      {/* Right arrow */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={style.arrowBtn}
      >
        <ChevronRight  style={{height: '15px', width:'15px'}}/>
      </button>
    </>
  );
};


Links.propTypes = {
  links: PropTypes.array,
  refreshLinks: PropTypes.func,
};

SimplePagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
};
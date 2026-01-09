import {useState, useEffect }from 'react'
import style from './Links.module.css'
import { format, parse } from 'date-fns';
import no_data_img from '../images/no_data.png';

import PropTypes from 'prop-types';

function Analytics({ links }) {
  const backendUrl = 'http://localhost:3000/';
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 7;
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    if (links.length > 0) {
      const pages = Math.ceil(links.length / linksPerPage);
      setTotalPages(pages);
    } else {
      setTotalPages(0);
    }
  }, [links, linksPerPage]);


  // Pagination logic
  const indexOfLastLink = currentPage * linksPerPage;
  const indexOfFirstLink = indexOfLastLink - linksPerPage;
  // const currentLinks = links.slice(indexOfFirstLink, indexOfLastLink);
  const currentLinks = Array.isArray(links) ? links.slice(indexOfFirstLink, indexOfLastLink) : [];


  
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
                      <th>IP Address</th>
                      <th>User Device</th>
                  </tr>
              </thead>

              <tbody>
                  {currentLinks.map((link, index) => (
                      <tr key={index}>
                          <td> {format(new Date(link.dateCreated), 'MMM dd, yyyy')}  {format(parse(link.timeCreated, 'hh:mm a', new Date()), 'HH:mm')}</td>
                          <td style={{ position: 'relative' }}> {link.originalUrl} </td>
                          <td style={{ position: 'relative' }}>{`${backendUrl}${link.shortCode}`}</td>
                          <td> {format(new Date(link.dateCreated), 'MMM dd, yyyy')}  {format(parse(link.timeCreated, 'hh:mm a', new Date()), 'HH:mm')}</td>
                          <td> {format(new Date(link.dateCreated), 'MMM dd, yyyy')}  {format(parse(link.timeCreated, 'hh:mm a', new Date()), 'HH:mm')}</td>
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

       </div>
          );
}

export default Analytics


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


Analytics.propTypes = {
  links: PropTypes.array,
  refreshLinks: PropTypes.func,
};

SimplePagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
};

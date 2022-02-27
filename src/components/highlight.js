import React from 'react';
export const Highlight = ({children, color}) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>
    {children}
  </span>
);

export const Blue = ({children}) => ( <Highlight color="#1877F2"> {children} </Highlight>)
export const Green = ({children}) => ( <Highlight color="#25c2a0"> {children} </Highlight>)


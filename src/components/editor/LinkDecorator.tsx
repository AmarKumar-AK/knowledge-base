import React from 'react';

// Link component for the decorator
const Link = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  // Ensure URL is absolute and has a proper protocol
  const formattedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
  
  return (
    <a 
      href={formattedUrl}
      style={{ color: '#1976d2', textDecoration: 'underline' }}
      target="_blank" 
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
};

// Function to find link entities
const findLinkEntities = (contentBlock: any, callback: any, contentState: any) => {
  contentBlock.findEntityRanges(
    (character: any) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

export { Link, findLinkEntities };

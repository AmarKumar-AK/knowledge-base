import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button, 
  Chip,
  Box
} from '@mui/material';
import { Document } from '../models/Document';
import { useNavigate } from 'react-router-dom';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const navigate = useNavigate();
  
  // Format date to a readable string
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get plain text preview from the content
  const getContentPreview = () => {
    try {
      const contentObj = JSON.parse(document.content);
      const firstBlock = contentObj.blocks?.[0];
      if (firstBlock && firstBlock.text) {
        return firstBlock.text.substring(0, 120) + (firstBlock.text.length > 120 ? '...' : '');
      }
      return 'No content preview available';
    } catch (e) {
      return 'Unable to parse content';
    }
  };

  return (
    <Card sx={{ 
      minWidth: 275, 
      mb: 2, 
      height: 240, // Increased height to accommodate tags better
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
        {/* One line for heading */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            mb: 1,
            height: '1.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {document.title}
        </Typography>
        
        {/* Two lines for content */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            height: '2.5em', // Height for approximately 2 lines
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1
          }}
        >
          {getContentPreview()}
        </Typography>
        
        {/* Two lines for tags with increased height */}
        <Box sx={{ 
          height: '4em', // Increased height for tags section
          overflow: 'hidden',
          mb: 1
        }}>
          {document.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }} 
            />
          ))}
        </Box>
        
        {/* One line for updated date */}
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: 'block',
            height: '1.5em',
            overflow: 'hidden'
          }}
        >
          Updated: {formatDate(document.updatedAt)}
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button 
          size="small" 
          onClick={() => navigate(`/view/${document.id}`)}
        >
          View
        </Button>
        <Button 
          size="small" 
          onClick={() => navigate(`/edit/${document.id}`)}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          color="error" 
          onClick={() => onDelete(document.id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default DocumentCard;

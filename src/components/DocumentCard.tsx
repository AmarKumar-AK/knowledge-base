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
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getContentPreview()}
        </Typography>
        <Box sx={{ mt: 2, mb: 1 }}>
          {document.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }} 
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Updated: {formatDate(document.updatedAt)}
        </Typography>
      </CardContent>
      <CardActions>
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

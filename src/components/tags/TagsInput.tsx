import React, { useState } from 'react';
import {
  Box,
  TextField,
  Chip,
  InputAdornment,
  IconButton,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({ tags, onTagsChange }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Tags
      </Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Add tags"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ flexGrow: 1, mr: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleRemoveTag(tag)}
          />
        ))}
      </Box>
    </>
  );
};

export default TagsInput;

import React from 'react';
import {
  Box,
  TextField,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TagsInputProps {
  tags: string[];
  newTag: string;
  onNewTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTag: () => void;
  onDeleteTag: (tagToDelete: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  newTag,
  onNewTagChange,
  onAddTag,
  onDeleteTag,
  onKeyPress
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Add tags..."
        value={newTag}
        onChange={onNewTagChange}
        onKeyPress={onKeyPress}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                edge="end" 
                onClick={onAddTag}
                disabled={!newTag.trim()}
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {tags.map((tag, index) => (
          <Chip 
            key={index} 
            label={tag} 
            onDelete={() => onDeleteTag(tag)} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

export default TagsInput;

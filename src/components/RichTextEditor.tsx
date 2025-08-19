import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
  Box,
  TextField,
  Button,
  Chip,
  InputAdornment,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

interface RichTextEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  isSaving?: boolean;
  onSave: (title: string, content: string, tags: string[]) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  isSaving = false,
  onSave
}) => {
  // State for the document title
  const [title, setTitle] = useState(initialTitle);
  
  // State for the editor
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        return EditorState.createWithContent(contentState);
      } catch (e) {
        console.error('Error parsing initial content:', e);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });
  
  // State for tags
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        setEditorState(EditorState.createWithContent(contentState));
      } catch (e) {
        console.error('Error setting initial content:', e);
      }
    }
    
    setTitle(initialTitle);
    setTags(initialTags);
  }, [initialContent, initialTitle, initialTags]);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    const contentJson = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    onSave(title, contentJson, tags);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Document Title"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        placeholder="Enter document title"
      />
      
      <TextField
        fullWidth
        label="Tags"
        variant="outlined"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyPress={handleKeyPress}
        margin="normal"
        placeholder="Add tags (press Enter to add)"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleAddTag} edge="end">
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleRemoveTag(tag)}
          />
        ))}
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Document Content
      </Typography>
      
      <Paper elevation={2} sx={{ mb: 2, p: 1 }}>
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          wrapperClassName="rich-editor-wrapper"
          editorClassName="rich-editor"
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'history', 'embedded', 'emoji', 'image'],
            inline: { inDropdown: false },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
          }}
        />
      </Paper>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={isSaving ? null : <SaveIcon />}
        onClick={handleSave}
        disabled={!title.trim() || isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Document'}
      </Button>
    </Box>
  );
};

export default RichTextEditor;

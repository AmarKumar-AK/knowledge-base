import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromRaw, RichUtils, getDefaultKeyBinding } from 'draft-js';
import { Editor } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '../SimpleEditor.css';
import {
  Box,
  TextField,
  Button,
  Chip,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

interface SimpleEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  isSaving?: boolean;
  onSave: (title: string, content: string, tags: string[]) => void;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
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
  
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    // Custom commands
    if (command === 'code-block') {
      handleEditorChange(RichUtils.toggleBlockType(editorState, 'code-block'));
      return 'handled';
    }
    
    // Default commands
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };
  
  const keyBindingFn = (e: React.KeyboardEvent) => {
    // Add keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      // Code block: Ctrl+Shift+K
      if (e.shiftKey && e.key === 'k') {
        return 'code-block';
      }
    }
    return getDefaultKeyBinding(e);
  };

  const toggleInlineStyle = (style: string) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType: string) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Check if the current selection has the specified inline style
  const hasInlineStyle = (style: string) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(style);
  };

  // Check if the current block has the specified block type
  const hasBlockType = (blockType: string) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    return currentBlock.getType() === blockType;
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
      
      <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
        <Tooltip title="Bold">
          <IconButton 
            onClick={() => toggleInlineStyle('BOLD')}
            color={hasInlineStyle('BOLD') ? "primary" : "default"}
          >
            <FormatBoldIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton 
            onClick={() => toggleInlineStyle('ITALIC')}
            color={hasInlineStyle('ITALIC') ? "primary" : "default"}
          >
            <FormatItalicIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton 
            onClick={() => toggleInlineStyle('UNDERLINE')}
            color={hasInlineStyle('UNDERLINE') ? "primary" : "default"}
          >
            <FormatUnderlinedIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Bulleted List">
          <IconButton 
            onClick={() => toggleBlockType('unordered-list-item')}
            color={hasBlockType('unordered-list-item') ? "primary" : "default"}
          >
            <FormatListBulletedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton 
            onClick={() => toggleBlockType('ordered-list-item')}
            color={hasBlockType('ordered-list-item') ? "primary" : "default"}
          >
            <FormatListNumberedIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Code Block (Ctrl+Shift+K)">
          <IconButton 
            onClick={() => toggleBlockType('code-block')}
            color={hasBlockType('code-block') ? "primary" : "default"}
          >
            <CodeIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 2, 
          p: 2,
          minHeight: '300px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          spellCheck={true}
          placeholder="Start typing here..."
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

export default SimpleEditor;

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
          toolbarClassName="rich-editor-toolbar"
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'history'],
            inline: {
              inDropdown: false,
              options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
            },
            blockType: {
              inDropdown: true,
              options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
            },
            fontSize: {
              inDropdown: true,
              options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
            },
            fontFamily: {
              inDropdown: true,
              options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
            },
            list: {
              inDropdown: false,
              options: ['unordered', 'ordered', 'indent', 'outdent'],
            },
            textAlign: {
              inDropdown: false,
              options: ['left', 'center', 'right', 'justify'],
            },
            colorPicker: {
              colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
                'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 'rgb(0,168,133)',
                'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 'rgb(40,50,78)', 'rgb(0,0,0)',
                'rgb(247,218,100)', 'rgb(251,160,38)', 'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)',
                'rgb(239,239,239)', 'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
                'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)'],
            },
            link: {
              inDropdown: false,
              showOpenOptionOnHover: true,
              defaultTargetOption: '_self',
              options: ['link', 'unlink'],
            },
            emoji: {
              emojis: [
                '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', '😣', '😫', '😴', '😌', '🤓',
                '😛', '😜', '😠', '😇', '😷', '😈', '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈',
                '🙉', '🙊', '👼', '👮', '🕵', '💂', '👳', '🎅', '👸', '👰', '👲', '🙍', '🙇', '🚶', '🏃', '💃',
                '⛷', '🏂', '🏌', '🏄', '🚣', '🏊', '⛹', '🏋', '🚴', '👫', '💪', '👈', '👉', '👉', '👆', '🖕',
                '👇', '🖖', '🤘', '🖐', '👌', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '🐵', '🐶', '🐇', '🐥',
                '🐸', '🐌', '🐛', '🐜', '🐝', '🍉', '🍄', '🍔', '🍤', '🍨', '🍪', '🎂', '🍰', '🍾', '🍷', '🍸',
                '🍺', '🌍', '🚑', '⏰', '🌙', '🌝', '🌞', '⭐', '🌟', '🌠', '🌨', '🌩', '⛄', '🔥', '🎄', '🎈',
                '🎉', '🎊', '🎁', '🎗', '🏀', '🏈', '🎲', '🔇', '🔈', '📣', '🔔', '🎵', '🎷', '💰', '🖊', '📅',
                '✅', '❎', '💯',
              ],
            },
            embedded: {
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              defaultSize: {
                height: 'auto',
                width: 'auto',
              },
            },
            image: {
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              urlEnabled: true,
              uploadEnabled: false,
              alignmentEnabled: true,
              previewImage: true,
              inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
              alt: { present: false, mandatory: false },
              defaultSize: {
                height: 'auto',
                width: '100%',
              },
            },
            history: {
              inDropdown: false,
              options: ['undo', 'redo'],
              className: undefined,
              component: undefined,
            },
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

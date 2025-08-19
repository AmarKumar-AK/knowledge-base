import React, { useState, useEffect, useMemo } from 'react';
import { 
  EditorState, 
  convertToRaw, 
  convertFromRaw, 
  RichUtils, 
  getDefaultKeyBinding,
  CompositeDecorator
} from 'draft-js';
import { Editor } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '../RichTextEditor.css';
import colorStyleMap, { textColorOptions, bgColorOptions } from './colorStyleMap';
import TagsInput from './tags';
import { EditorToolbar, LinkDialog } from './toolbar';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface RichTextEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  isSaving?: boolean;
  onSave: (title: string, content: string, tags: string[]) => void;
}

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

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  isSaving = false,
  onSave
}) => {
  // Create decorator for links
  const decorator = useMemo(() => {
    return new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);
  }, []);

  // State for the document title
  const [title, setTitle] = useState(initialTitle);
  
  // State for the editor
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        return EditorState.createWithContent(contentState, decorator);
      } catch (e) {
        console.error('Error parsing initial content:', e);
        return EditorState.createEmpty(decorator);
      }
    }
    return EditorState.createEmpty(decorator);
  });
  
  // State for tags
  const [tags, setTags] = useState<string[]>(initialTags);
  
  // State for link dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  useEffect(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        setEditorState(EditorState.createWithContent(contentState, decorator));
      } catch (e) {
        console.error('Error setting initial content:', e);
      }
    }
    
    setTitle(initialTitle);
    setTags(initialTags);
  }, [initialContent, initialTitle, initialTags, decorator]);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
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
    if (command === 'add-link') {
      openLinkDialog();
      return 'handled';
    }
    if (command === 'remove-link') {
      const selection = editorState.getSelection();
      if (!selection.isCollapsed()) {
        const nextEditorState = RichUtils.toggleLink(
          editorState,
          selection,
          null
        );
        handleEditorChange(nextEditorState);
      }
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

  // Simple function to open link dialog
  const openLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const keyBindingFn = (e: React.KeyboardEvent) => {
    // Add keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      // Code block: Ctrl+Shift+K
      if (e.shiftKey && e.key === 'k') {
        return 'code-block';
      }
      // Link: Ctrl+K
      if (!e.shiftKey && e.key === 'k') {
        return 'add-link';
      }
      // Remove link: Ctrl+Shift+U
      if (e.shiftKey && e.key === 'u') {
        return 'remove-link';
      }
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Document Title
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter document title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <TagsInput 
        tags={tags}
        onTagsChange={setTags}
      />
      
      <Typography variant="subtitle1" gutterBottom>
        Document Content
      </Typography>
      
      <EditorToolbar
        editorState={editorState}
        onEditorChange={handleEditorChange}
        textColorOptions={textColorOptions}
        bgColorOptions={bgColorOptions}
        onOpenLinkDialog={openLinkDialog}
      />
      
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 2, 
          overflow: 'hidden',
          '& .DraftEditor-root': {
            minHeight: '300px'
          }
        }}
        className="rich-editor-wrapper"
      >
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          spellCheck={true}
          placeholder="Start typing here..."
          customStyleMap={colorStyleMap}
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

      {/* Link Dialog */}
      <LinkDialog
        isOpen={linkDialogOpen}
        editorState={editorState}
        onEditorChange={handleEditorChange}
        onClose={() => setLinkDialogOpen(false)}
      />
    </Box>
  );
};

export default RichTextEditor;

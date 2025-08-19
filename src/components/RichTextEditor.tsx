import React, { useState, useEffect, useMemo } from 'react';
import { 
  EditorState, 
  convertToRaw, 
  convertFromRaw, 
  RichUtils, 
  getDefaultKeyBinding,
  Modifier,
  CompositeDecorator
} from 'draft-js';
import { Editor } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '../RichTextEditor.css';
import colorStyleMap, { textColorOptions, bgColorOptions } from './colorStyleMap';
import { BackgroundColorPicker, TextColorPicker, LinkDialog } from './editor';
import TagsInput from './tags';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
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
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

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
      removeLink();
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

  // Link handling functions
  const openLinkDialog = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = selection.getStartKey();
      const startOffset = selection.getStartOffset();
      const endOffset = selection.getEndOffset();
      const block = contentState.getBlockForKey(startKey);
      const selectedText = block.getText().slice(startOffset, endOffset);
      setLinkText(selectedText);
      
      // Check if the selected text already has a link
      const entityKey = block.getEntityAt(startOffset);
      if (entityKey) {
        const entity = contentState.getEntity(entityKey);
        if (entity.getType() === 'LINK') {
          // If there's already a link, get its URL
          const { url } = entity.getData();
          setLinkUrl(url);
        } else {
          setLinkUrl('');
        }
      } else {
        setLinkUrl('');
      }
      
      setLinkDialogOpen(true);
    } else {
      // If no text is selected, show an empty dialog
      setLinkText('');
      setLinkUrl('');
      setLinkDialogOpen(true);
    }
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const confirmLink = () => {
    // Ensure URL has proper protocol
    let url = linkUrl.trim();
    if (url && !url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      { url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    
    let nextEditorState = EditorState.set(editorState, { 
      currentContent: contentStateWithEntity 
    });
    
    // If text is already selected, apply the link to that selection
    if (!editorState.getSelection().isCollapsed()) {
      // First remove any existing links on this selection (to avoid stacking)
      nextEditorState = RichUtils.toggleLink(
        nextEditorState,
        nextEditorState.getSelection(),
        null
      );
      // Then apply the new link
      nextEditorState = RichUtils.toggleLink(
        nextEditorState,
        nextEditorState.getSelection(),
        entityKey
      );
    } else if (linkText) {
      // If no text is selected but linkText is provided, insert it with the link
      const selection = nextEditorState.getSelection();
      const contentStateWithText = Modifier.insertText(
        contentStateWithEntity,
        selection,
        linkText,
        undefined,
        entityKey
      );
      nextEditorState = EditorState.push(
        nextEditorState,
        contentStateWithText,
        'insert-characters'
      );
    }
    
    handleEditorChange(nextEditorState);
    closeLinkDialog();
  };
  
  // Function to remove a link from selected text
  const removeLink = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const nextEditorState = RichUtils.toggleLink(
        editorState,
        selection,
        null
      );
      handleEditorChange(nextEditorState);
    }
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

  const toggleInlineStyle = (style: string) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };
  
  const toggleBlockType = (blockType: string) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const hasInlineStyle = (style: string) => {
    return editorState.getCurrentInlineStyle().has(style);
  };
  
  const hasBlockType = (blockType: string) => {
    const selection = editorState.getSelection();
    const currentBlockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    return currentBlockType === blockType;
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

        {/* Text Color Picker */}
        <TextColorPicker
          editorState={editorState}
          onEditorChange={handleEditorChange}
          colorOptions={textColorOptions}
        />

        {/* Background Color Picker */}
        <BackgroundColorPicker
          editorState={editorState}
          onEditorChange={handleEditorChange}
          colorOptions={bgColorOptions}
        />
        
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
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Add/Edit Link (Ctrl+K) | Remove Link (Ctrl+Shift+U)">
          <IconButton 
            onClick={openLinkDialog}
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
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
        open={linkDialogOpen}
        linkUrl={linkUrl}
        linkText={linkText}
        onClose={closeLinkDialog}
        onConfirm={confirmLink}
        onRemoveLink={removeLink}
        onLinkTextChange={setLinkText}
        onLinkUrlChange={setLinkUrl}
      />
    </Box>
  );
};

export default RichTextEditor;

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
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// Import our editor components
import {
  Link,
  findLinkEntities,
  LinkDialog,
  ColorPicker,
  EditorToolbar,
  TagsInput,
  createLink,
  removeLink,
  removeTextColors,
  removeBackgroundColors,
  colorStyleMap,
  textColorOptions,
  bgColorOptions
} from './editor';

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
  const [newTag, setNewTag] = useState('');
  
  // State for link dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // State for color pickers
  const [textColorAnchorEl, setTextColorAnchorEl] = useState<null | HTMLElement>(null);
  const [bgColorAnchorEl, setBgColorAnchorEl] = useState<null | HTMLElement>(null);

  const openTextColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTextColorAnchorEl(event.currentTarget);
  };

  const closeTextColorPicker = () => {
    setTextColorAnchorEl(null);
  };

  const openBgColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setBgColorAnchorEl(event.currentTarget);
  };

  const closeBgColorPicker = () => {
    setBgColorAnchorEl(null);
  };

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
    if (command === 'add-link') {
      openLinkDialog();
      return 'handled';
    }
    if (command === 'remove-link') {
      handleEditorChange(removeLink(editorState));
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
    const nextEditorState = createLink(editorState, linkUrl, linkText);
    handleEditorChange(nextEditorState);
    closeLinkDialog();
  };
  
  // Remove unused function
  /*
  const handleRemoveLink = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const nextEditorState = removeLink(editorState, selection);
      handleEditorChange(nextEditorState);
    }
  };
  */
  
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
  
  // Apply a specific text color
  const applyTextColor = (colorStyle: string) => {
    toggleInlineStyle(colorStyle);
    closeTextColorPicker();
  };
  
  // Apply a specific background color
  const applyBgColor = (colorStyle: string) => {
    toggleInlineStyle(colorStyle);
    closeBgColorPicker();
  };
  
  // Remove text color from selected text
  const removeTextColor = () => {
    const styles = textColorOptions.map(option => option.style);
    const nextEditorState = removeTextColors(editorState, styles);
    handleEditorChange(nextEditorState);
    closeTextColorPicker();
  };
  
  // Remove background color from selected text
  const removeBgColor = () => {
    const styles = bgColorOptions.map(option => option.style);
    const nextEditorState = removeBackgroundColors(editorState, styles);
    handleEditorChange(nextEditorState);
    closeBgColorPicker();
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
      
      <Typography variant="subtitle1" gutterBottom>
        Tags
      </Typography>
      <TagsInput
        tags={tags}
        newTag={newTag}
        onNewTagChange={(e) => setNewTag(e.target.value)}
        onAddTag={handleAddTag}
        onDeleteTag={handleRemoveTag}
        onKeyPress={handleKeyPress}
      />
      
      <Typography variant="subtitle1" gutterBottom>
        Document Content
      </Typography>
      
      <EditorToolbar
        onToggleInlineStyle={toggleInlineStyle}
        onToggleBlockType={toggleBlockType}
        onOpenTextColorPicker={openTextColorPicker}
        onOpenBgColorPicker={openBgColorPicker}
        onOpenLinkDialog={openLinkDialog}
        hasInlineStyle={hasInlineStyle}
        hasBlockType={hasBlockType}
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
      {/* Link Dialog */}
      <LinkDialog
        open={linkDialogOpen}
        onClose={closeLinkDialog}
        linkUrl={linkUrl}
        linkText={linkText}
        onLinkTextChange={(e) => setLinkText(e.target.value)}
        onLinkUrlChange={(e) => setLinkUrl(e.target.value)}
        onConfirm={confirmLink}
        onRemove={() => {
          handleEditorChange(removeLink(editorState));
          closeLinkDialog();
        }}
      />

      {/* Text Color Picker */}
      <ColorPicker
        open={Boolean(textColorAnchorEl)}
        anchorEl={textColorAnchorEl}
        onClose={closeTextColorPicker}
        colorOptions={textColorOptions}
        onSelectColor={applyTextColor}
        onRemoveColor={removeTextColor}
        title="Text Color"
      />

      {/* Background Color Picker */}
      <ColorPicker
        open={Boolean(bgColorAnchorEl)}
        anchorEl={bgColorAnchorEl}
        onClose={closeBgColorPicker}
        colorOptions={bgColorOptions}
        onSelectColor={applyBgColor}
        onRemoveColor={removeBgColor}
        title="Background Color"
      />
    </Box>
  );
};

export default RichTextEditor;

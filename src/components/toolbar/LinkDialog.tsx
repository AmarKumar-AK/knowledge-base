import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { EditorState, RichUtils, Modifier } from 'draft-js';

interface LinkDialogProps {
  editorState: EditorState;
  onEditorChange: (editorState: EditorState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LinkDialog: React.FC<LinkDialogProps> = ({
  editorState,
  onEditorChange,
  isOpen,
  onClose
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Initialize the dialog state when it opens
  useEffect(() => {
    if (isOpen) {
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
      } else {
        // If no text is selected, show an empty dialog
        setLinkText('');
        setLinkUrl('');
      }
    }
  }, [isOpen, editorState]);

  const closeLinkDialog = () => {
    setLinkUrl('');
    setLinkText('');
    onClose();
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
    
    onEditorChange(nextEditorState);
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
      onEditorChange(nextEditorState);
      closeLinkDialog();
    }
  };

  return (
    <Dialog open={isOpen} onClose={closeLinkDialog}>
      <DialogTitle>
        {linkUrl ? 'Edit Link' : 'Add Link'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the URL and text for your link. If you don't include http:// or https://, 
          https:// will be added automatically.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="link-text"
          label="Link Text"
          type="text"
          fullWidth
          variant="outlined"
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="link-url"
          label="URL (e.g., example.com or https://example.com)"
          type="text"
          fullWidth
          variant="outlined"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="example.com"
          helperText="Enter domain name only or full URL with http:// or https://"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeLinkDialog} color="primary">
          Cancel
        </Button>
        {linkUrl && (
          <Button 
            onClick={removeLink} 
            color="error"
          >
            Remove Link
          </Button>
        )}
        <Button 
          onClick={confirmLink} 
          color="primary" 
          disabled={!linkUrl.trim()}
        >
          {linkUrl ? 'Update Link' : 'Add Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkDialog;

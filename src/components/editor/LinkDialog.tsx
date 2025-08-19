import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';

interface LinkDialogProps {
  open: boolean;
  linkUrl: string;
  linkText: string;
  onClose: () => void;
  onConfirm: () => void;
  onRemoveLink: () => void;
  onLinkTextChange: (value: string) => void;
  onLinkUrlChange: (value: string) => void;
}

const LinkDialog: React.FC<LinkDialogProps> = ({
  open,
  linkUrl,
  linkText,
  onClose,
  onConfirm,
  onRemoveLink,
  onLinkTextChange,
  onLinkUrlChange
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
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
          onChange={(e) => onLinkTextChange(e.target.value)}
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
          onChange={(e) => onLinkUrlChange(e.target.value)}
          placeholder="example.com"
          helperText="Enter domain name only or full URL with http:// or https://"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        {linkUrl && (
          <Button 
            onClick={() => {
              onRemoveLink();
              onClose();
            }} 
            color="error"
          >
            Remove Link
          </Button>
        )}
        <Button 
          onClick={onConfirm} 
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

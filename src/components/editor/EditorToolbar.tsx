import React from 'react';
import {
  Box,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';

interface EditorToolbarProps {
  hasInlineStyle: (style: string) => boolean;
  hasBlockType: (blockType: string) => boolean;
  onToggleInlineStyle: (style: string) => void;
  onToggleBlockType: (blockType: string) => void;
  onOpenLinkDialog: () => void;
  onOpenTextColorPicker: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenBgColorPicker: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  hasInlineStyle,
  hasBlockType,
  onToggleInlineStyle,
  onToggleBlockType,
  onOpenLinkDialog,
  onOpenTextColorPicker,
  onOpenBgColorPicker
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, borderBottom: '1px solid #e0e0e0' }}>
      <Tooltip title="Bold (Ctrl+B)">
        <IconButton 
          onClick={() => onToggleInlineStyle('BOLD')}
          color={hasInlineStyle('BOLD') ? "primary" : "default"}
        >
          <FormatBoldIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic (Ctrl+I)">
        <IconButton 
          onClick={() => onToggleInlineStyle('ITALIC')}
          color={hasInlineStyle('ITALIC') ? "primary" : "default"}
        >
          <FormatItalicIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline">
        <IconButton 
          onClick={() => onToggleInlineStyle('UNDERLINE')}
          color={hasInlineStyle('UNDERLINE') ? "primary" : "default"}
        >
          <FormatUnderlinedIcon />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem />
      <Tooltip title="Text Color">
        <IconButton onClick={onOpenTextColorPicker}>
          <FormatColorTextIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Background Color">
        <IconButton onClick={onOpenBgColorPicker}>
          <FormatColorFillIcon />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem />
      <Tooltip title="Bulleted List">
        <IconButton 
          onClick={() => onToggleBlockType('unordered-list-item')}
          color={hasBlockType('unordered-list-item') ? "primary" : "default"}
        >
          <FormatListBulletedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Numbered List">
        <IconButton 
          onClick={() => onToggleBlockType('ordered-list-item')}
          color={hasBlockType('ordered-list-item') ? "primary" : "default"}
        >
          <FormatListNumberedIcon />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem />
      <Tooltip title="Code Block (Ctrl+Shift+K)">
        <IconButton 
          onClick={() => onToggleBlockType('code-block')}
          color={hasBlockType('code-block') ? "primary" : "default"}
        >
          <CodeIcon />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem />
      <Tooltip title="Add/Edit Link (Ctrl+K) | Remove Link (Ctrl+Shift+U)">
        <IconButton 
          onClick={onOpenLinkDialog}
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default EditorToolbar;

import React from 'react';
import { EditorState, RichUtils } from 'draft-js';
import {
  Box,
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
import { ColorOption } from '../colorStyleMap';
import TextColorPicker from './TextColorPicker';
import BackgroundColorPicker from './BackgroundColorPicker';

interface EditorToolbarProps {
  editorState: EditorState;
  onEditorChange: (editorState: EditorState) => void;
  textColorOptions: ColorOption[];
  bgColorOptions: ColorOption[];
  onOpenLinkDialog: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editorState,
  onEditorChange,
  textColorOptions,
  bgColorOptions,
  onOpenLinkDialog
}) => {
  const toggleInlineStyle = (style: string) => {
    onEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };
  
  const toggleBlockType = (blockType: string) => {
    onEditorChange(RichUtils.toggleBlockType(editorState, blockType));
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
        onEditorChange={onEditorChange}
        colorOptions={textColorOptions}
      />

      {/* Background Color Picker */}
      <BackgroundColorPicker
        editorState={editorState}
        onEditorChange={onEditorChange}
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
          onClick={onOpenLinkDialog}
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default EditorToolbar;

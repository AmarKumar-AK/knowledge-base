import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import { ColorOption } from '../colorStyleMap';
import { EditorState, RichUtils } from 'draft-js';

interface TextColorPickerProps {
  editorState: EditorState;
  onEditorChange: (editorState: EditorState) => void;
  colorOptions: ColorOption[];
}

const TextColorPicker: React.FC<TextColorPickerProps> = ({
  editorState,
  onEditorChange,
  colorOptions
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const openTextColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeTextColorPicker = () => {
    setAnchorEl(null);
  };

  // Apply a specific text color
  const applyTextColor = (colorStyle: string) => {
    const newState = RichUtils.toggleInlineStyle(editorState, colorStyle);
    onEditorChange(newState);
    closeTextColorPicker();
  };
  
  // Remove text color from selected text
  const removeTextColor = () => {
    // Remove all text color styles
    let nextEditorState = editorState;
    colorOptions.forEach(({ style }) => {
      if (editorState.getCurrentInlineStyle().has(style)) {
        nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);
      }
    });
    
    onEditorChange(nextEditorState);
    closeTextColorPicker();
  };

  return (
    <>
      <Tooltip title="Text Color">
        <IconButton onClick={openTextColorPicker}>
          <FormatColorTextIcon />
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeTextColorPicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', maxWidth: '220px' }}>
          {colorOptions.map((option: ColorOption) => (
            <Tooltip key={option.style} title={option.label}>
              <IconButton
                onClick={() => applyTextColor(option.style)}
                sx={{
                  width: 28,
                  height: 28,
                  m: 0.5,
                  backgroundColor: option.color,
                  '&:hover': {
                    backgroundColor: option.color,
                    opacity: 0.8,
                  },
                }}
              >
                <span />
              </IconButton>
            </Tooltip>
          ))}
          <Tooltip title="Remove Color">
            <IconButton onClick={removeTextColor} sx={{ m: 0.5 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Popover>
    </>
  );
};

export default TextColorPicker;

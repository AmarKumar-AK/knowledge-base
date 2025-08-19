import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import { ColorOption } from '../colorStyleMap';
import { EditorState, RichUtils } from 'draft-js';

interface BackgroundColorPickerProps {
  editorState: EditorState;
  onEditorChange: (editorState: EditorState) => void;
  colorOptions: ColorOption[];
}

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  editorState,
  onEditorChange,
  colorOptions
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const openBgColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeBgColorPicker = () => {
    setAnchorEl(null);
  };

  // Apply a specific background color
  const applyBgColor = (colorStyle: string) => {
    const newState = RichUtils.toggleInlineStyle(editorState, colorStyle);
    onEditorChange(newState);
    closeBgColorPicker();
  };
  
  // Remove background color from selected text
  const removeBgColor = () => {
    // Remove all background color styles
    let nextEditorState = editorState;
    colorOptions.forEach(({ style }) => {
      if (editorState.getCurrentInlineStyle().has(style)) {
        nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);
      }
    });
    
    onEditorChange(nextEditorState);
    closeBgColorPicker();
  };

  return (
    <>
      <Tooltip title="Background Color">
        <IconButton onClick={openBgColorPicker}>
          <FormatColorFillIcon />
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeBgColorPicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', maxWidth: '220px' }}>
          {colorOptions.map((option: ColorOption) => (
            <Tooltip key={option.style} title={option.label}>
              <IconButton
                onClick={() => applyBgColor(option.style)}
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
          <Tooltip title="Remove Background">
            <IconButton onClick={removeBgColor} sx={{ m: 0.5 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Popover>
    </>
  );
};

export default BackgroundColorPicker;

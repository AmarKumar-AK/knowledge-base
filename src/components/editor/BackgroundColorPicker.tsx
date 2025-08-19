import React from 'react';
import {
  Box,
  IconButton,
  Popover,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { ColorOption } from '../colorStyleMap';

interface BackgroundColorPickerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onColorSelect: (style: string) => void;
  onColorRemove: () => void;
  colorOptions: ColorOption[];
}

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  open,
  anchorEl,
  onClose,
  onColorSelect,
  onColorRemove,
  colorOptions
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', maxWidth: '220px' }}>
        {colorOptions.map((option: ColorOption) => (
          <Tooltip key={option.style} title={option.label}>
            <IconButton
              onClick={() => onColorSelect(option.style)}
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
          <IconButton onClick={onColorRemove} sx={{ m: 0.5 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Popover>
  );
};

export default BackgroundColorPicker;

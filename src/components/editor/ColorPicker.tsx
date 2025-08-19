import React from 'react';
import {
  Popover,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import type { ColorOption } from './colorOptions';

interface ColorPickerProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  colorOptions: ColorOption[];
  onSelectColor: (style: string) => void;
  onRemoveColor: () => void;
  title: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  anchorEl,
  open,
  onClose,
  colorOptions,
  onSelectColor,
  onRemoveColor,
  title
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
              onClick={() => onSelectColor(option.style)}
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
        <Tooltip title={`Remove ${title}`}>
          <IconButton onClick={onRemoveColor} sx={{ m: 0.5 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Popover>
  );
};

export default ColorPicker;

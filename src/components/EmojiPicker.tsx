import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Popover } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'emoji-popover' : undefined;

  const emojis = [
    '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', '😣', '😫', '😴', '😌', '🤓',
    '😛', '😜', '😠', '😇', '😷', '😈', '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈',
    '🙉', '🙊', '👼', '👮', '🕵', '💂', '👳', '🎅', '👸', '👰', '👲', '🙍', '🙇', '🚶', '🏃', '💃',
    '⛷', '🏂', '🏌', '🏄', '🚣', '🏊', '⛹', '🏋', '🚴', '👫', '💪', '👈', '👉', '👉', '👆', '🖕',
    '👇', '🖖', '🤘', '🖐', '👌', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '🐵', '🐶', '🐇', '🐥',
    '🐸', '🐌', '🐛', '🐜', '🐝', '🍉', '🍄', '🍔', '🍤', '🍨', '🍪', '🎂', '🍰', '🍾', '🍷', '🍸',
    '🍺', '🌍', '🚑', '⏰', '🌙', '🌝', '🌞', '⭐', '🌟', '🌠', '🌨', '🌩', '⛄', '🔥', '🎄', '🎈',
    '🎉', '🎊', '🎁', '🎗', '🏀', '🏈', '🎲', '🔇', '🔈', '📣', '🔔', '🎵', '🎷', '💰', '🖊', '📅',
    '✅', '❎', '💯',
  ];

  return (
    <Box>
      <Button 
        variant="text"
        color="primary"
        onClick={handleClick}
        startIcon={<EmojiEmotionsIcon />}
      >
        Emojis
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, maxWidth: 300, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Select an emoji
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {emojis.map((emoji, index) => (
              <Box 
                key={index} 
                sx={{ 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)' 
                  }
                }}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
};

export default EmojiPicker;

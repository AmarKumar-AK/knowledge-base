import { EditorState, RichUtils, Modifier, SelectionState } from 'draft-js';

// Helper to create a link in the editor
export const createLink = (
  editorState: EditorState, 
  url: string, 
  text?: string
): EditorState => {
  let contentState = editorState.getCurrentContent();
  let selection = editorState.getSelection();
  
  // If no text is provided and selection is collapsed, return unchanged
  if (!text && selection.isCollapsed()) {
    return editorState;
  }
  
  // First, if there's text provided and selection is collapsed, insert it
  if (text && selection.isCollapsed()) {
    contentState = Modifier.insertText(
      contentState,
      selection,
      text
    );
    
    // Update selection to cover the newly inserted text
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + text.length;
    
    selection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    }) as SelectionState;
  }
  
  // Format the URL with proper protocol if needed
  let formattedUrl = url.trim();
  if (formattedUrl && !formattedUrl.match(/^https?:\/\//i)) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  // Create the entity with our URL
  contentState = contentState.createEntity(
    'LINK',
    'MUTABLE',
    { url: formattedUrl }
  );
  
  const entityKey = contentState.getLastCreatedEntityKey();
  
  // Apply entity to the selected text
  const nextEditorState = EditorState.push(
    editorState,
    Modifier.applyEntity(
      contentState,
      selection,
      entityKey
    ),
    'apply-entity'
  );
  
  return nextEditorState;
};

// Helper to remove a link
export const removeLink = (editorState: EditorState): EditorState => {
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) {
    return editorState;
  }
  
  return RichUtils.toggleLink(editorState, selection, null);
};

// Helper to remove text colors
export const removeTextColors = (
  editorState: EditorState, 
  textColorStyles: string[]
): EditorState => {
  let nextEditorState = editorState;
  textColorStyles.forEach(style => {
    if (editorState.getCurrentInlineStyle().has(style)) {
      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);
    }
  });
  return nextEditorState;
};

// Helper to remove background colors
export const removeBackgroundColors = (
  editorState: EditorState, 
  bgColorStyles: string[]
): EditorState => {
  let nextEditorState = editorState;
  bgColorStyles.forEach(style => {
    if (editorState.getCurrentInlineStyle().has(style)) {
      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);
    }
  });
  return nextEditorState;
};

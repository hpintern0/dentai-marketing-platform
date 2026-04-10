-- Fix piece_type constraint to accept all copy types
ALTER TABLE campaign_pieces DROP CONSTRAINT IF EXISTS campaign_pieces_piece_type_check;
ALTER TABLE campaign_pieces ADD CONSTRAINT campaign_pieces_piece_type_check
  CHECK (piece_type IN (
    'instagram_ad', 'carousel_slide', 'video',
    'instagram_caption', 'stories_copy', 'whatsapp_cta',
    'copy_manifest', 'youtube_metadata', 'threads_post', 'other'
  ));

-- Add withdrawal_refund transaction type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'withdrawal_refund' 
    AND enumtypid = 'transaction_type'::regtype
  ) THEN
    ALTER TYPE transaction_type ADD VALUE 'withdrawal_refund';
  END IF;
END $$;
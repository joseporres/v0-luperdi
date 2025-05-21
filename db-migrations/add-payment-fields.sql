-- Add payment-related fields to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add comment to the columns for documentation
COMMENT ON COLUMN transactions.payment_status IS 'Status of the payment (pending, processing, completed, failed, refunded, cancelled)';
COMMENT ON COLUMN transactions.payment_id IS 'ID from the payment processor';
COMMENT ON COLUMN transactions.payment_method IS 'Method used for payment (credit_card, paypal, bank_transfer, etc.)';

-- Function to update client's financial_profile with the process number from the new case
CREATE OR REPLACE FUNCTION update_client_case_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if client_id is present in the new case
  IF NEW.client_id IS NOT NULL THEN
    -- Update the financial_profile of the client
    -- We use jsonb_set to update or insert the 'process_number' key
    UPDATE clients
    SET financial_profile = jsonb_set(
      COALESCE(financial_profile, '{}'::jsonb),
      '{process_number}',
      to_jsonb(NEW.process_number)
    )
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire after inserting a new case
DROP TRIGGER IF EXISTS trigger_update_client_case_number ON cases;

CREATE TRIGGER trigger_update_client_case_number
AFTER INSERT ON cases
FOR EACH ROW
EXECUTE FUNCTION update_client_case_number();

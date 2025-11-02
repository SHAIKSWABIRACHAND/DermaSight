// A list of pre-approved, fake license numbers for simulation purposes.
const VALID_LICENSES = ['DOC12345', 'MD67890', 'SPEC007', 'GP2024'];

/**
 * Simulates verifying a medical license number against a database.
 * This check is case-insensitive.
 * @param licenseNumber The medical license number to verify.
 * @returns A promise that resolves to true if the license is valid, false otherwise.
 */
export const verifyLicense = async (licenseNumber: string): Promise<boolean> => {
  console.log(`Verifying license: ${licenseNumber}`);
  
  return new Promise((resolve) => {
    // Simulate network delay for verification process
    setTimeout(() => {
      const normalizedInput = licenseNumber.trim().toUpperCase();
      const isValid = VALID_LICENSES.includes(normalizedInput);
      
      if (isValid) {
        console.log(`License ${licenseNumber} is valid.`);
        resolve(true);
      } else {
        console.log(`License ${licenseNumber} is invalid.`);
        resolve(false);
      }
    }, 1500); // 1.5 second delay
  });
};

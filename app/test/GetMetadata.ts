import Client from './Autodesk_Functions';

export async function extractMetadata(urn: string): Promise<boolean> {
  try {
    let token = await Client.getAccesstoken(); // Get Autodesk API token
    const viewableObjects: Object = await Client.getAllViewables(
      token.access_token,
      urn
    ); // get all Viewables
    for (const viewableObject of viewableObjects.data.metadata) {
      // Wait for 0.5 second before fetching another object properties
      await new Promise((resolve) => setTimeout(resolve, 500));
      const objectName = viewableObject.name;
      const objectRole = viewableObject.role;
      const objectGUID = viewableObject.guid;
      try {
        let objectProperties = await Client.getAllViewableProperties(
          token.access_token,
          urn,
          objectGUID
        );

        while (objectProperties.result === 'success') {
          console.log(`Extracting ${objectName} metadata...`);

          // Wait for 1 second before fetching object properties
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Fetch object properties again inside the loop
          const updatedObjectProperties = await Client.getAllViewableProperties(
            token.access_token,
            urn,
            objectGUID
          );

          // Update objectProperties for the next iteration
          objectProperties = updatedObjectProperties;
        }

        console.log(objectProperties); // Log the final objectProperties when the loop exits
      } catch (error) {
        console.error(error);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

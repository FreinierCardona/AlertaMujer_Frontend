import * as ImagePicker from "expo-image-picker";
export async function pickEvidence(camera: boolean) {
  const permission = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== "granted")
    return { error: "Se requiere permiso para adjuntar una fotografía." };
  const result = camera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
  return result.canceled ? {} : { uri: result.assets[0].uri };
}

import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/modules/auth/AuthProvider";
export default function Index() {
  const { ready, signedIn } = useAuth();
  if (!ready)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  return <Redirect href={signedIn ? "/home" : "/auth/login"} />;
}

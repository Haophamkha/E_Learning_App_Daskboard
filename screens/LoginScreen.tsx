import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../auth/store";
import { login, AuthUser } from "../auth/authSlice";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/type";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppDispatch } from "../auth/store";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
    const dispatch = useDispatch<AppDispatch>();

  const navigation = useNavigation<NavProp>();
  const { loading, error, userType } = useSelector(
    (state: RootState) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePw, setHidePw] = useState(true);

  const handleLogin = () => {
    if (!username || !password) return;

  dispatch(login({ username, password }))
    .unwrap()
    .then((res) => {
      const payload = res as { user: AuthUser; type: "admin" | "teacher" };
      if (payload.type === "admin") navigation.replace("Admin");
      else if (payload.type === "teacher") navigation.replace("Teacher");
    })
    .catch((err) => console.log(err));

  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f0f4f7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng trở lại!</Text>

        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#999"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Mật khẩu"
            secureTextEntry={hidePw}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setHidePw(!hidePw)}
            style={{ padding: 8 }}
          >
            <Ionicons
              name={hidePw ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00BCD4",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    height: 50,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputPassword: { flex: 1, fontSize: 16 },
  btn: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  error: { color: "red", textAlign: "center", marginBottom: 8 },
});

package findu.backend.auth.info;

import lombok.Getter;

import java.util.Map;

@Getter
public class GoogleUserInfo {

    private final Map<String, Object> attributes;

    public GoogleUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public String getEmail() {
        return (String) attributes.get("email");
    }

    public String getNickname() {
        return (String) attributes.get("name");
    }

    public String getProfileImage() {
        return (String) attributes.get("picture");
    }
}
package Ai_Study_Hub.Config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioProperties {
    private String url;
    private Access access = new Access();
    private Bucket bucket = new Bucket();

    @Getter
    @Setter
    public static class Access {
        private String name;
        private String secret;
    }

    @Getter
    @Setter
    public static class Bucket {
        private String name;
    }
}

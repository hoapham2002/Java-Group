package Ai_Study_Hub.Config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RedisStreamConfig {

    private final StringRedisTemplate redisTemplate;

    public static final String STREAM_KEY = "rag_task_stream";
    public static final String CONSUMER_GROUP = "rag_python_worker_group";

    @PostConstruct
    public void initStreamAndGroup() {
        try {
            // Đẩy 1 message rỗng để tạo Stream nếu chưa có
            if (Boolean.FALSE.equals(redisTemplate.hasKey(STREAM_KEY))) {
                redisTemplate.opsForStream().add(STREAM_KEY, java.util.Map.of("init", "1"));
                log.info("Created Stream '{}'", STREAM_KEY);
            }
            // Tạo Consumer Group. Nếu group đã tồn tại, Redis sẽ ném ra ngoại lệ BUSYGROUP
            redisTemplate.opsForStream().createGroup(STREAM_KEY, CONSUMER_GROUP);
            log.info("Successfully created Consumer Group '{}'", CONSUMER_GROUP);
        } catch (org.springframework.data.redis.RedisSystemException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            String causeMsg = e.getCause() != null && e.getCause().getMessage() != null ? e.getCause().getMessage() : "";
            if (msg.contains("BUSYGROUP") || causeMsg.contains("BUSYGROUP")) {
                log.info("Consumer Group '{}' already exists. Skipping creation.", CONSUMER_GROUP);
            } else {
                log.warn("RedisSystemException during Stream/Group initialization: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.warn("Unexpected error during Stream/Group initialization: {}", e.getMessage());
        }
    }
}

package Ai_Study_Hub.Service;

import Ai_Study_Hub.Config.RedisStreamConfig;
import Ai_Study_Hub.Domain.dto.RagTaskMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisProducerService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void pushTask(RagTaskMessage message) {
        try {
            // Convert Object to JSON String
            String jsonMessage = objectMapper.writeValueAsString(message);
            
            // Push to Redis Stream
            // We use a Map with a single key "payload"
            redisTemplate.opsForStream().add(RedisStreamConfig.STREAM_KEY, Map.of("payload", jsonMessage));
            
            log.info("Pushed task to Redis Stream '{}': {}", RedisStreamConfig.STREAM_KEY, jsonMessage);
        } catch (Exception e) {
            log.error("Failed to push task to Redis Stream", e);
            throw new RuntimeException("Failed to push task to Redis Stream", e);
        }
    }
}

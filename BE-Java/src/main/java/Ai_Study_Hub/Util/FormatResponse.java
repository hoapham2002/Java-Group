package Ai_Study_Hub.Util;

import org.apache.catalina.connector.Response;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import Ai_Study_Hub.Domain.RestResponse;

@RestControllerAdvice
public class FormatResponse implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType,
            MediaType selectedContentType,
            Class selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {
        if (body instanceof String || body instanceof Response) {
            return body;
        }
        if (response instanceof ServerHttpResponse) {
            int status = ((ServletServerHttpResponse) response).getServletResponse().getStatus();
            if (status >= 400) {
                return body;
            }
        }

        RestResponse<Object> res = RestResponse.builder()
                .status(HttpStatus.OK.value())
                .message("SUCCESS")
                .data(body)
                .error(null)
                .build();
        return res;
    }

}
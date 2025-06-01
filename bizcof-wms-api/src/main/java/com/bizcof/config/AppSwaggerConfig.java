package com.bizcof.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class AppSwaggerConfig {

    @Bean
    public OpenAPI openAPI(@Value("${springdoc.version}") String springdocVersion) {
        Info info = new Info()
          .title("BIZCOF Swagger")
          .version(springdocVersion)
          .description("Bizcof");

        // 로컬 서버 설정
        Server localServer = new Server();
        localServer.setDescription("local");
        localServer.setUrl("http://localhost:30011");  // https로 변경
/*
        // 개발 서버 설정
        Server devServer = new Server();
        devServer.setDescription("dev");
        devServer.setUrl("https://d-air-clare-api.tidesquare.com");
*/
        // 운영 서버 설정
        Server prodServer = new Server();
        prodServer.setDescription("production");
        prodServer.setUrl("https://wms.bizcof.com");

        SecurityScheme securityScheme = new SecurityScheme()
          .type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")
          .in(SecurityScheme.In.HEADER).name("Authorization");
        SecurityRequirement schemaRequirement = new SecurityRequirement().addList("bearerAuth");

        return new OpenAPI()
          .components(new Components().addSecuritySchemes("bearerAuth", securityScheme))
            .openapi("3.0.3") // 🔥 OpenAPI 버전 명시
          .security(Arrays.asList(schemaRequirement))
          // 서버 리스트 추가
          .servers(Arrays.asList( localServer, prodServer))
          .info(info);
    }
}

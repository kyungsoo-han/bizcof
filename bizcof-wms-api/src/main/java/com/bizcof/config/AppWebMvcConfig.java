package com.bizcof.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.nio.charset.Charset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Configuration
public class AppWebMvcConfig implements WebMvcConfigurer, ApplicationContextAware {

  private ApplicationContext applicationContext;

  public static final DateTimeFormatter ISO_LOCAL_DATE_FIXED_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  public static final DateTimeFormatter ISO_LOCAL_TIME_FIXED_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

  public static final DateTimeFormatter ISO_ZONE_TIME_FIXED_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(this.localeChangeInterceptor());
    //registry.addInterceptor(this.loggingInterceptor()).addPathPatterns("/api/**");
  }

  @Override
  public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    converters.add(stringHttpMessageConverter());
  }

  @Bean
  public StringHttpMessageConverter stringHttpMessageConverter() {
    return new StringHttpMessageConverter(Charset.forName("UTF-8"));
  }

  @Bean
  @Primary
  public ObjectMapper serializingObjectMapper() {
    ObjectMapper objectMapper = new ObjectMapper();
//    objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);  -- 항공은 null이어도 필드 보내달라는 FE 요구가 있어서 설정 수정
    objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    objectMapper.configure(MapperFeature.AUTO_DETECT_GETTERS, true);
    objectMapper.configure(MapperFeature.AUTO_DETECT_IS_GETTERS, true);
    objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
    objectMapper.configure(MapperFeature.DEFAULT_VIEW_INCLUSION, false);
    objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    JavaTimeModule javaTimeModule = new JavaTimeModule();

    objectMapper.registerModule(javaTimeModule);
    return objectMapper;
  }

  @Bean
  // TODO 언어별표기는 Client에서 처리, Server는 Return Message용으로 구성중..
  public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor localeChangeInterceptor = new LocaleChangeInterceptor();
    localeChangeInterceptor.setParamName("language");
    return localeChangeInterceptor;
  }

  @Bean
  public LocaleResolver localeResolver() {
    CookieLocaleResolver cookieLocaleResolver = new CookieLocaleResolver();
    cookieLocaleResolver.setCookieName("language");
    cookieLocaleResolver.setCookiePath("/");
    cookieLocaleResolver.setDefaultLocale(new Locale("ko_KR"));
    return cookieLocaleResolver;
  }

  @Override
  public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
    this.applicationContext = applicationContext;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("http://localhost:80"
                , "http://localhost:8080"
                , "http://localhost:9090"
                , "http://localhost:10011"
                , "http://localhost:20011"
        ,"https://one-api.solutionil.com")
        .allowedMethods("PUT", "DELETE", "POST", "GET").allowedHeaders("*").allowCredentials(true)
        .exposedHeaders("accessToken", "Content-Disposition").maxAge(3600);
  }
/*
  @Bean
  public MultipartConfigElement multipartConfigElement() {
    MultipartConfigFactory factory = new MultipartConfigFactory();
    factory.setMaxFileSize(DataSize.of(GlobalConstants.MAX_FILE_SIZE, DataUnit.MEGABYTES));
    factory.setMaxRequestSize(DataSize.of(GlobalConstants.MAX_REQUEST_SIZE, DataUnit.MEGABYTES));
    return factory.createMultipartConfig();
  }*/

  @Bean
  public MultipartResolver multipartResolver() {
    return new StandardServletMultipartResolver();
  }
}

package com.library.config;

import graphql.schema.GraphQLScalarType;
import graphql.schema.Coercing;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(GraphQLScalarType.newScalar()
                        .name("_Any")
                        .description("Federation _Any scalar")
                        .coercing(new Coercing<Object, Object>() {
                            @Override
                            public Object serialize(Object dataFetcherResult) {
                                return dataFetcherResult;
                            }

                            @Override
                            public Object parseValue(Object input) {
                                return input;
                            }

                            @Override
                            public Object parseLiteral(Object input) {
                                return input;
                            }
                        })
                        .build()
                );
    }
}

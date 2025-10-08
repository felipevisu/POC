name := "bitonic-sequence"
version := "0.1.0"
scalaVersion := "3.7.3"

val http4sVersion = "0.23.32"
val circeVersion = "0.14.6"

libraryDependencies ++= Seq(
    "org.http4s" %% "http4s-ember-server" % http4sVersion,
    "org.http4s" %% "http4s-dsl" % http4sVersion,
    "org.http4s" %% "http4s-circe" % http4sVersion,
    "io.circe" %% "circe-generic" % circeVersion,
    "io.circe" %% "circe-parser" % circeVersion,
    "org.typelevel" %% "cats-effect" % "3.5.2",
    "dev.profunktor" %% "redis4cats-effects" % "1.5.2",
    "dev.profunktor" %% "redis4cats-log4cats" % "1.5.2",
    "org.typelevel" %% "log4cats-slf4j" % "2.6.0",
    "ch.qos.logback" % "logback-classic" % "1.4.11"
)

enablePlugins(JavaAppPackaging)
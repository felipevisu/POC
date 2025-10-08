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
    "org.typelevel" %% "cats-effect" % "3.5.2"
)

enablePlugins(JavaAppPackaging)
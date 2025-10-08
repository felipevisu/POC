import cats.effect.{IO, IOApp, ExitCode}
import org.http4s.HttpRoutes
import org.http4s.dsl.io.*
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.implicits.http4sKleisliResponseSyntaxOptionT
import org.http4s.circe.CirceEntityCodec.{circeEntityDecoder, circeEntityEncoder}
import io.circe.generic.auto.{deriveDecoder, deriveEncoder}
import com.comcast.ip4s.{ipv4, port}

case class User(name: String, email: String)

object BitonicApi extends IOApp {
  
  val routes = HttpRoutes.of[IO] {
    case req @ POST -> Root / "users" =>
      for {
        user <- req.as[User]
        response <- Ok(s"Created user: ${user.name}")
      } yield response
      
    case GET -> Root / "health" =>
      Ok("OK")
  }.orNotFound

  def run(args: List[String]): IO[ExitCode] =
    EmberServerBuilder
      .default[IO]
      .withHost(ipv4"0.0.0.0")
      .withPort(port"8080")
      .withHttpApp(routes)
      .build
      .use(_ => IO.never)
      .as(ExitCode.Success)
}
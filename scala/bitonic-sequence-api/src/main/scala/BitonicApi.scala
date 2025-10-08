import cats.effect.{IO, IOApp, ExitCode}
import org.http4s.{HttpRoutes, Response, Status}
import org.http4s.dsl.io.*
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.implicits.http4sKleisliResponseSyntaxOptionT
import org.http4s.circe.CirceEntityCodec.{circeEntityDecoder, circeEntityEncoder}
import io.circe.generic.auto.{deriveDecoder, deriveEncoder}
import com.comcast.ip4s.{ipv4, port}

case class BitonicRequest(n: Int, l: Int, r: Int) derives io.circe.Codec
case class BitonicResponse(result: List[Int], cached: Boolean = false) derives io.circe.Codec

object BitonicApi extends IOApp {

  def routes(cache: RedisCache): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "calculate" =>
      for {
        request <- req.as[BitonicRequest]
        result = BitonicSequence.calculate(request.n, request.l, request.r)
        response <- IO.pure(
          Response[IO](Status.Ok).withEntity(BitonicResponse(result, cached = false))
        )
      } yield response

    case req @ POST -> Root / "calculate-cached" =>
      for {
        request <- req.as[BitonicRequest]
        key = cache.generateKey(request.n, request.l, request.r)

        cachedResult <- cache.get[List[Int]](key)

        result <- cachedResult match {
          case Some(cached) =>
            IO.pure(BitonicResponse(cached, cached= true))
          case None =>
            val calculated = BitonicSequence.calculate(request.n, request.l, request.r)
            cache.set(key, calculated, ttlSeconds = 3600).map(_ =>
              BitonicResponse(calculated, cached = false)
            )
        }

        response <- IO.pure(
          Response[IO](Status.Ok).withEntity(result)
        )
      } yield response
      
    case GET -> Root / "health" =>
      IO.pure(Response[IO](Status.Ok).withEntity("OK"))
  }

  def run(args: List[String]): IO[ExitCode] = {
    val redisUri = sys.env.getOrElse("REDIS_URI", null)
    RedisCache.make(redisUri).use { cache =>
      EmberServerBuilder
        .default[IO]
        .withHost(ipv4"0.0.0.0")
        .withPort(port"8080")
        .withHttpApp(routes(cache).orNotFound)
        .build
        .use(_ => IO.never)
        .as(ExitCode.Success)
    }
    
  }
}
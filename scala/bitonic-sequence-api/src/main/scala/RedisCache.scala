import cats.effect.{IO, Resource}
import dev.profunktor.redis4cats.Redis
import dev.profunktor.redis4cats.effect.Log.Stdout.given
import io.circe.syntax.EncoderOps
import io.circe.parser.decode
import io.circe.{Encoder, Decoder}
import scala.concurrent.duration.DurationInt

class RedisCache(redis: dev.profunktor.redis4cats.RedisCommands[IO, String, String]){
    def get[T](key: String)(using decoder: Decoder[T]): IO[Option[T]] = {
        redis.get(key).flatMap {
            case Some(json) =>
                IO.fromEither(decode[T](json)).map(Some(_)).handleError(_ => None)
            case None =>
                IO.pure(None)
        }
    }

    def set[T](key: String, value: T, ttlSeconds: Int = 3600)(using encoder: Encoder[T]): IO[Unit] = {
        val json = value.asJson.noSpaces
        redis.setEx(key, json, ttlSeconds.seconds)
    }

    def generateKey(n: Int, l: Int, r: Int): String = {
        s"bitonic:$n:$l:$r"
    }
}

object RedisCache {
    def make(redisUri: String): Resource[IO, RedisCache] = {
        Redis[IO].utf8(redisUri).map(new RedisCache(_))
    }
}
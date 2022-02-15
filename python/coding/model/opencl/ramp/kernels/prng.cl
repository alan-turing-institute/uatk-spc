/*
  Random Number Generation
*/

// Floating point random number generation for normal and exponential variates currently uses
// Box-Muller and Inversion Transform based approaches. The ziggurat is generally preferred
// for these distributions, but we've chosen simpler, slightly more expensive options.

constant float PI = 3.14159274101257324;

// 32 bit Xoshiro128++ random number generator. Given a 128 bit uint4 state in global device
// memory, updates that state and returns a random 32 bit unsigned integer. Random states must be
// initialised externally.
uint xoshiro128pp_next(global uint4* s) {
  const uint x = s->x + s->w;
  const uint result = ((x << 7) | (x >> (32 - 7))) + s->x;

  const uint t = s->y << 9;

  s->z ^= s->x;
  s->w ^= s->y;
  s->y ^= s->z;
  s->x ^= s->w;

  s->z ^= t;
  s->w = (s->w << 11) | (s->w >> (32 - 11));

  return result;
}

// Generate a random float in the interval [0, 1]
float rand(global uint4* rng) {
  // Get the 23 upper bits (i.e number of bits in fp mantissa)
  const uint u = xoshiro128pp_next(rng) >> 9;
  // Cast to a float and divide by the largest 23 bit unsigned integer.
  return (float)u / (float)((1 << 23) - 1);
}

// Generate a sample from the standard normal distribution, calculated using the Box-Muller transform
float randn(global uint4* rng) {
  float u = rand(rng);
  float v = rand(rng);
  return sqrt(-2 * log(u)) * cos(2 * PI * v);
}

// Generate a random draw from an exponential distribution with rate 1.0 using inversion transform method.
float rand_exp(global uint4* rng) {
  return -log((float)1.0 - rand(rng));
}

// Generate a random draw from a weibull distribution with provided shape and scale
float rand_weibull(global uint4* rng, float scale, float shape) {
  return scale * pow(rand_exp(rng), ((float)1.0 / shape));
}

float lognormal(global uint4* rng, float meanlog, float sdlog){
  return exp(meanlog + sdlog * randn(rng));
}

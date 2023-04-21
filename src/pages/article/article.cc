#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/val.h>
#include <openssl/err.h>
#include <openssl/evp.h>

#include <cstdio>
#include <string>

extern "C" char *decrypt_string(const char *input_ciphertext_b64,
                                const char *input_key, const char *input_iv,
                                const char *algorithm) {
  // Ref:
  // https://wiki.openssl.org/index.php/EVP_Symmetric_Encryption_and_Decryption

  const unsigned char *ciphertext_b64 =
      reinterpret_cast<const unsigned char *>(input_ciphertext_b64);

  int ciphertext_b64_len = strlen(input_ciphertext_b64);
  int input_key_len = strlen(input_key);
  int input_iv_len = strlen(input_iv);

  // Additional 0x10 bytes was added in case of something I don't know.
  unsigned char *ciphertext =
      new unsigned char[ciphertext_b64_len / 4 * 3 + 0x10];
  unsigned char *plaintext =
      new unsigned char[ciphertext_b64_len / 4 * 3 + 0x10];
  int ciphertext_len = 0, plaintext_len = 0;

  // DecodeBlock:
  //   The output will be padded with 0 bits if necessary to ensure
  //   that the output is always 3 bytes for every 4 input bytes.
  ciphertext_len =
      EVP_DecodeBlock(ciphertext, ciphertext_b64, ciphertext_b64_len);
  if (ciphertext_len <= 0) {
    emscripten_console_errorf("EVP_DecodeBlock() failed with %d",
                              ciphertext_len);
    return reinterpret_cast<char *>(-1);
  }

  EVP_CIPHER_CTX *ctx;
  if (!(ctx = EVP_CIPHER_CTX_new())) {
    emscripten_console_errorf("EVP_CIPHER_CTX_new() failed");
    return reinterpret_cast<char *>(-1);
  }

  EVP_CIPHER *cipher;
  if (!(cipher = EVP_CIPHER_fetch(NULL, algorithm, NULL))) {
    emscripten_console_errorf(
        "EVP_CIPHER_fetch(NULL, algorithm, NULL) failed, which "
        "algorithm=\"%s\"",
        algorithm);
    return reinterpret_cast<char *>(-1);
  }

  // Ignore tailing zero added by DecodeBlock (Original data already padded).
  ciphertext_len = ciphertext_len & ~(EVP_CIPHER_get_block_size(cipher) - 1);

  int key_len = EVP_CIPHER_get_key_length(cipher);
  int iv_len = EVP_CIPHER_get_iv_length(cipher);
  unsigned char *key = new unsigned char[key_len];
  unsigned char *iv = new unsigned char[iv_len + 1];
  for (size_t i = 0; i < key_len; i++) {
    key[i] = (i < input_key_len) ? input_key[i] : 0;
  }
  for (size_t i = 0; i < iv_len; i++) {
    iv[i] = (i < input_iv_len) ? input_iv[i] : 0;
  }

  int rc = EVP_DecryptInit_ex2(ctx, cipher, key, iv, NULL);
  if (1 != rc) {
    emscripten_console_errorf("EVP_DecryptInit_ex2() failed, return %d", rc);
    return reinterpret_cast<char *>(-1);
  }

  rc = EVP_DecryptUpdate(ctx, plaintext, &plaintext_len, ciphertext,
                         ciphertext_len);
  if (1 != rc) {
    emscripten_console_errorf("EVP_DecryptUpdate() failed, return %d", rc);
    return reinterpret_cast<char *>(-1);
  }

  rc = EVP_DecryptFinal_ex(ctx, plaintext + plaintext_len, &plaintext_len);
  if (1 != rc) {
    emscripten_console_errorf("EVP_DecryptFinal_ex() failed, return %d", rc);
    return reinterpret_cast<char *>(-1);
  }

  delete[] ciphertext;
  delete[] key;
  delete[] iv;
  EVP_CIPHER_free(cipher);
  EVP_CIPHER_CTX_free(ctx);

  return reinterpret_cast<char *>(plaintext);
}

int main() { return 0; }

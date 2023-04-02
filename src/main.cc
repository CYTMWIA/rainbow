#include <cmark-gfm.h>
#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/val.h>
#include <openssl/err.h>
#include <openssl/evp.h>

#include <cstdio>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>

using json = nlohmann::json;

std::string document_location(const std::string &member) {
  using val = emscripten::val;
  return val::global("document")["location"][member].as<std::string>();
}

std::unordered_map<std::string, std::string> parse_query(
    const std::string &query) {
  std::unordered_map<std::string, std::string> res;
  size_t begin = 0;
  std::string key;
  enum { NONE, KEY, VALUE } state = NONE;
  for (size_t i = 0; i < query.size(); i++) {
    if (state == NONE) {
      if (query[i] == '?')
        continue;
      else {
        begin = i;
        state = KEY;
      }
    } else if (state == KEY) {
      if (query[i] == '=') {
        key = query.substr(begin, i - begin);
        begin = i + 1;
        state = VALUE;
      }
    } else if (state == VALUE) {
      if (query[i] == '&' || i == query.size() - 1) {
        res[key] = query.substr(begin, i - begin);
        begin = i + 1;
        state = KEY;
      }
    }
  }
  return res;
}

std::string markdown_to_html(const std::string &raw) {
  char *md = cmark_markdown_to_html(raw.c_str(), raw.size(), 0);
  std::string res{md};
  free(md);
  return res;
}

std::string decrypt_string(const std::string &ciphertext_b64,
                           const std::string &key, const std::string &iv,
                           const std::string &algorithm = "AES-256-CBC") {
  // Ref:
  // https://wiki.openssl.org/index.php/EVP_Symmetric_Encryption_and_Decryption
  std::vector<uint8_t> ciphertext(ciphertext_b64.size());
  std::vector<uint8_t> plaintext(ciphertext_b64.size());
  int ciphertext_len = 0, plaintext_len = 0, len, ok = 9527;
  int key_len, iv_len;
  unsigned char *key_ptr, *iv_ptr;
  EVP_CIPHER_CTX *ctx;
  EVP_CIPHER *cipher;

  len = EVP_DecodeBlock(
      ciphertext.data(),
      reinterpret_cast<const unsigned char *>(ciphertext_b64.data()),
      ciphertext_b64.size());
  if (len <= 0) goto err_DecodeBlock;
  ciphertext_len = len;

  if (!(ctx = EVP_CIPHER_CTX_new())) goto err_New;
  if (!(cipher = EVP_CIPHER_fetch(NULL, algorithm.c_str(), NULL))) goto err_New;

  key_len = EVP_CIPHER_get_key_length(cipher);
  iv_len = EVP_CIPHER_get_iv_length(cipher);
  key_ptr = new unsigned char[key_len];
  iv_ptr = new unsigned char[iv_len+1];
  for (size_t i = 0; i < key_len; i++) {
    if (i < key.size())
      key_ptr[i] = key[i];
    else
      key_ptr[i] = 0;
  }
  for (size_t i = 0; i < iv_len; i++) {
    if (i < iv.size())
      iv_ptr[i] = iv[i];
    else
      iv_ptr[i] = 0;
  }

  ok = EVP_DecryptInit_ex2(ctx, cipher, key_ptr, iv_ptr, NULL);
  if (1 != ok) goto err_EVP_DecryptInit_ex2;

  ok = EVP_DecryptUpdate(ctx, plaintext.data(), &len, ciphertext.data(),
                         ciphertext_len);
  if (1 != ok) goto err_EVP_DecryptUpdate;
  plaintext_len = len;

  if (ciphertext_len % EVP_CIPHER_get_block_size(cipher)) {
    ok = EVP_DecryptFinal_ex(ctx, plaintext.data() + plaintext_len, &len);
    if (1 != ok) goto err_EVP_DecryptFinal_ex;
    plaintext_len += len;
  }

  delete[] key_ptr;
  delete[] iv_ptr;
  EVP_CIPHER_free(cipher);
  EVP_CIPHER_CTX_free(ctx);
  EM_ASM({ console.log($0); }, ciphertext_len);
  return std::string(reinterpret_cast<char *>(plaintext.data()), plaintext_len);

err_DecodeBlock:
  EM_ASM({ console.log("EVP_DecodeBlock() failed with", $0); }, len);
  goto err;
err_New:
  EM_ASM({ console.log("EVP_CIPHER_CTX_new() or EVP_CIPHER_fetch() failed"); });
  goto err;
err_EVP_DecryptInit_ex2:
  EM_ASM({ console.log("EVP_DecryptInit_ex2() failed with", $0); }, ok);
  goto err;
err_EVP_DecryptUpdate:
  EM_ASM({ console.log("EVP_DecryptUpdate() failed with", $0); }, ok);
  goto err;
err_EVP_DecryptFinal_ex:
  EM_ASM({ console.log("EVP_DecryptFinal_ex() failed with", $0); }, ok);
  goto err;
err:
  EM_ASM(alert("Failed to decrypt string"););
  ERR_print_errors_fp(stderr);
  exit(-1);
}

json parse_json(char *ptr_json_str) {
  std::string json_str = std::string(ptr_json_str);

  auto query = parse_query(document_location("search"));
  if (query.count("password")) {
    emscripten_console_log(query["password"].c_str());
    // decrypt_string()
  }

  auto res = json::parse(json_str, nullptr, false);
  if (res.is_discarded()) {
    EM_ASM(alert("Invaild json (maybe wrong password)."));
    exit(-1);
  }
  return res;
}

void replace_document_body(const std::string &inner_html) {
  emscripten::val::global("document")["body"].set("innerHTML", inner_html);
}

void page_index(const json &page) {}

void page_article(const json &page) {
  if (page.contains("content")) {
    std::string content = page["content"];
    replace_document_body(markdown_to_html(content));
  }
}

extern "C" int frontend_entry(char *ptr_json_str) {
  auto page = parse_json(ptr_json_str);

  std::string type = "article";
  if (page.contains("type")) {
    type = page["type"];
  }

  if (type == "index") {
    page_index(page);
  } else if (type == "article") {
    page_article(page);
  } else {
    EM_ASM(alert("Unknown page type."));
    exit(-1);
  }
  emscripten_console_log(
      decrypt_string("t3K3YMr13j/kw5DBfHw3Vw==", "1", "1").c_str());
  return 0;
}

int main() {
  emscripten_console_log("Hello, there! This is `main.cc`");
  return 0;
}

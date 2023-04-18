#include <GLES3/gl3.h>
#include <emscripten/html5_webgl.h>
#include <emscripten/val.h>

#include <Eigen/Dense>
#include <chrono>

auto milliseconds_since_epoch() {
  return std::chrono::duration_cast<std::chrono::microseconds>(
             std::chrono::steady_clock::now().time_since_epoch())
             .count() /
         1000.0;
}

unsigned int shader_program;
bool init_shader() {
  int success;
  char info_log[512];

  // 顶点着色器
  const char *vertex_shader_src =
#include "vertex_shader.inc"
      ;
  unsigned int vertex_shader;
  vertex_shader = glCreateShader(GL_VERTEX_SHADER);
  glShaderSource(vertex_shader, 1, &vertex_shader_src, NULL);
  glCompileShader(vertex_shader);

  glGetShaderiv(vertex_shader, GL_COMPILE_STATUS, &success);
  if (!success) {
    glGetShaderInfoLog(vertex_shader, 512, NULL, info_log);
    emscripten_console_error("glCompileShader(vertex_shader) FAILED");
    emscripten_console_error(info_log);
    return false;
  }
  // emscripten_console_log("glCompileShader(vertex_shader) OK");

  // 片段着色器
  const char *fragment_shader_src =
#include "fragment_shader.inc"
      ;
  unsigned int fragment_shader;
  fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
  glShaderSource(fragment_shader, 1, &fragment_shader_src, NULL);
  glCompileShader(fragment_shader);

  glGetShaderiv(fragment_shader, GL_COMPILE_STATUS, &success);
  if (!success) {
    glGetShaderInfoLog(fragment_shader, 512, NULL, info_log);
    emscripten_console_error("glCompileShader(fragment_shader) FAILED");
    emscripten_console_error(info_log);
    return false;
  }
  // emscripten_console_log("glCompileShader(fragment_shader) OK");

  // 着色器程序
  shader_program = glCreateProgram();
  glAttachShader(shader_program, vertex_shader);
  glAttachShader(shader_program, fragment_shader);
  glLinkProgram(shader_program);

  glGetProgramiv(shader_program, GL_LINK_STATUS, &success);
  if (!success) {
    glGetProgramInfoLog(shader_program, 512, NULL, info_log);
    emscripten_console_error("glLinkProgram(shader_program) FAILED");
    emscripten_console_error(info_log);
    return false;
  }
  // emscripten_console_log("glLinkProgram(shader_program) OK");

  glUseProgram(shader_program);
  glDeleteShader(vertex_shader);
  glDeleteShader(fragment_shader);
  return true;
}

const char *CANVAS_ELEM = "#background";
int CANVAS_WIDTH, CANVAS_HEIGHT;
bool fit_canvas_size() {
  CANVAS_HEIGHT = emscripten::val::global("window")["innerHeight"].as<int>();
  CANVAS_WIDTH = emscripten::val::global("window")["innerWidth"].as<int>();
  auto res = emscripten_set_canvas_element_size(CANVAS_ELEM, CANVAS_WIDTH,
                                                CANVAS_HEIGHT);
  if (res != EMSCRIPTEN_RESULT_SUCCESS) return false;
  return true;
}

Eigen::Matrix4f perspective_matrix(float fov_angle, float aspect_ratio,
                                   float zNear, float zFar) {
  float r = tan((fov_angle * M_PI) / 180.0 / 2.0) * zNear;
  float l = -r;
  float t = r / aspect_ratio;
  float b = -t;
  float n = -zNear;
  float f = -zFar;
  // clang-format off
  Eigen::Matrix4f persp2ortho;
  persp2ortho << n, 0,   0,    0, 
                 0, n,   0,    0,
                 0, 0, n+f, -n*f,
                 0, 0,   1,    0;
  Eigen::Matrix4f ortho;
  ortho << 2/(r-l),       0,       0, -(r+l)/(r-l),
                 0, 2/(t-b),       0, -(t+b)/(t-b),
                 0,       0, 2/(n-f), -(n+f)/(n-f),
                 0,       0,       0,            1;
  // clang-format on
  return ortho * persp2ortho;
}

Eigen::Matrix4f view_matrix(const Eigen::Vector3f &e, const Eigen::Vector3f &t,
                            const Eigen::Vector3f &g) {
  Eigen::Matrix4f T, R;
  Eigen::Vector3f gt = g.cross(t);
  // clang-format off
  T << 1, 0, 0, -e.x(),
       0, 1, 0, -e.y(),
       0, 0, 1, -e.z(),
       0, 0, 0,      1;
  R << gt.x(), gt.y(), gt.z(), 0,
        t.x(),  t.y(),  t.z(), 0,
       -g.x(), -g.y(), -g.z(), 0,
            0,      0,      0, 1;
  // clang-format on
  return R * T;
}

Eigen::Matrix4f model_matrix(float rotation_angle) {
  double rad = (rotation_angle * M_PI) / 180.0;
  Eigen::Matrix4f model;
  // clang-format off
  model <<  cos(rad), 0, sin(rad), 0,
                   0, 1,        0, 0,
           -sin(rad), 0, cos(rad), 0,
                   0, 0,        0, 1;
  // clang-format on
  return model;
}

void frame() {
  using namespace Eigen;
  // Time
  static float last = milliseconds_since_epoch(), dt = 0;
  float now = milliseconds_since_epoch();
  dt = now - last;
  last = now;
  // Camera
  Vector3f camera_pos{0, 0, 6}, camera_up{0, 1, 0}, camera_lookat{0, 0, -1};
  float fov = 60, near = 0.1, far = 50;
  // Objects
  static float rotation_angle = 0;
  Matrix<float, 4, 8> cube;
  // clang-format off
  cube <<  1, -1,  1, -1, 1,-1, 1,-1,
          -1, -1, -1, -1, 1, 1, 1, 1,
           1,  1, -1, -1, 1, 1,-1,-1,
           1,  1,  1,  1, 1, 1, 1, 1;
  // clang-format on

  rotation_angle += dt / 100;

  // clang-format off
  cube =  perspective_matrix(fov, CANVAS_WIDTH / CANVAS_HEIGHT, near, far) 
        * view_matrix(camera_pos, camera_up, camera_lookat)
        * model_matrix(rotation_angle) 
        * cube;
  // clang-format on

  auto cube_data = cube.data();
  for (int i = 0; i < 8; i++) {
    float w = cube_data[i * 4 + 3];
    cube_data[i * 4 + 0] = cube_data[i * 4 + 0] / w;
    cube_data[i * 4 + 1] = cube_data[i * 4 + 1] / w;
    cube_data[i * 4 + 2] = cube_data[i * 4 + 2] / w + 0.5;
    cube_data[i * 4 + 3] = 1;
  }

  glClearColor(0, 0, 0, 1);
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  unsigned int VBO;
  glGenBuffers(1, &VBO);
  glBindBuffer(GL_ARRAY_BUFFER, VBO);
  glBufferData(GL_ARRAY_BUFFER, sizeof(float) * cube.size(), cube.data(),
               GL_STATIC_DRAW);

  glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void *)0);
  glEnableVertexAttribArray(0);

  glDrawArrays(GL_LINE_LOOP, 0, 8);
  // glDrawArrays(GL_TRIANGLES, 0, 8);
}

int main() {
  if (!fit_canvas_size()) {
    emscripten_console_log("Failed to fit_canvas_size()");
    return -2;
  }

  EmscriptenWebGLContextAttributes attr;
  emscripten_webgl_init_context_attributes(&attr);
  auto ctx = emscripten_webgl_create_context(CANVAS_ELEM, &attr);
  emscripten_webgl_make_context_current(ctx);

  if (!init_shader()) {
    emscripten_console_log("Failed to init_shader()");
    return -1;
  }

  emscripten_set_main_loop(frame, 0, 1);
  return 0;
}
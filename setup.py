from distutils.core import setup

setup(name="easy3d_viewer",
      version="1.0",
      description="Python wrapper for Easy3DViewer.",
      author="Haonan Chang",
      author_email="chnme40cs@gmail.com",
      url="https://github.com/changhaonan/Easy3DViewer",
      packages=["easy3d_viewer"],
      package_dir = {"" : "utils/python"},
      install_requires=["numpy"]
    )
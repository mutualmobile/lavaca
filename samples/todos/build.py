"""

MM Boilerplate Project v1.0.0
(c) 2012 Mutual Mobile
Released under the MIT license.

"""

import codecs
import datetime
import getopt
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import webbrowser
from xml.dom import minidom

class FileManager(object):
    def open(self, path, mode='r'):
        return codecs.open(path, encoding='utf-8', mode=mode)
    def read(self, path):
        f = self.open(path)
        result = f.read()
        f.close()
        return result
    def write(self, path, data):
        f = self.open(path, mode='w+')
        f.write(data)
        f.close()

class Config(FileManager):
    def __init__(self):
        self.overrides = {}
        self.text_store = {}
        self.__dict__.update({
            'config_file': 'config.json',
            'src': 'src',
            'dst': 'www',
            'test': 'test',
            'js_src': 'js',
            'css_src': 'css',
            'js_dst': 'js',
            'css_dst': 'css/app',
            'combine_js': True,
            'combine_css': True,
            'compress_js': True,
            'compress_css': True,
            'inline_js': False,
            'inline_css': False,
            'js_compilation_level': 'SIMPLE_OPTIMIZATIONS',
            'run_src_tests': True,
            'run_dst_tests': True,
            'compress_html': True,
            'remove_comments': True,
            'index_page': 'index.html',
            'css_vendors': ['webkit', 'moz', 'ms', 'o'],
            'log_file': 'build.log',
            'log_level': 'INFO',
            'target': 'local',
            'target_js_config_only': True,
            'license': 'license.txt',
            'run_doc': True,
            'doc_dst': 'docs',
            'icon_src': 'img',
            'splash_src': 'img',
            'ios': True,
            'ios_dst': 'ios/www/',
            'ios_icon_dst': 'ios/App/Resources/icons',
            'ios_splash_dst': 'ios/App/Resources/splash',
            'android': True,
            'android_dst': 'android/assets/www',
            'android_icon_dst': 'android/res',
            'js_package_def': 'scripts.xml',
            'css_package_def': 'styles.xml',
            })
    def update(self, opts):
        self.__dict__.update(opts)
    def override(self, prop, value):
        self.overrides[prop] = value
    def get(self, prop):
        if self.has_override(prop):
            return self.overrides[prop]
        else:
            return self.__dict__[prop]
    def has_override(self, prop):
        return prop in self.overrides
    def load(self, path=None):
        if not path:
            path = self.get('config_file')
            new_path = re.sub(r'\.json$', '.%s.json' % self.get('target'), path)
            if os.path.exists(new_path):
                path = new_path
        if os.path.exists(path):
            f = open(path, 'r')
            user_config = json.load(f)
            f.close()
            self.update(user_config)
        else:
            raise Exception('Invalid config file "%s"' % path)
    def get_license(self):
        if not 'license' in self.text_store:
            if os.path.exists(self.get('license')):
                self.text_store['license'] = self.read(self.get('license'))
            else:
                raise Exception('Invalid license file"%s"' % self.get('license'))
        return self.text_store['license']
    def get_src_folder(self):
        return os.path.abspath(self.get('src'))
    def get_dst_folder(self):
        return os.path.abspath(self.get('dst'))
    def get_test_folder(self):
        return os.path.abspath(self.get('test'))
    def get_js_src_folder(self):
        return os.path.join(self.get_src_folder(), self.get('js_src'))
    def get_index_page(self):
        return os.path.join(self.get_src_folder(), self.get('index_page'))
    def get_js_package_def(self):
        return os.path.join(self.get_src_folder(), self.get('js_package_def'))
    def get_css_package_def(self):
        return os.path.join(self.get_src_folder(), self.get('css_package_def'))
    def get_css_src_folder(self):
        return os.path.join(self.get_src_folder(), self.get('css_src'))
    def get_js_dst_folder(self):
        return os.path.join(self.get_dst_folder(), self.get('js_dst'))
    def get_css_dst_folder(self):
        return os.path.join(self.get_dst_folder(), self.get('css_dst'))
    def get_js_dst_path(self, package):
        return os.path.join(self.get_js_dst_folder(), '%s.js' % package)
    def get_css_dst_path(self, package):
        return os.path.join(self.get_css_dst_folder(), '%s.css' % package)
    def get_doc_dst_folder(self):
        return os.path.abspath(self.get('doc_dst'))
    def get_test_dst_folder(self):
        return os.path.abspath(self.get('test'))
    def get_cordova_dst_folder(self, key):
        return os.path.abspath(self.get('%s_dst' % key))
    def get_js_compiler_options(self):
        return {
            'compilation_level': self.get('js_compilation_level')
            }
    def get_css_compiler_options(self):
        return {}

class PackageCompiler(FileManager):
    suffix = '.js'
    package_def_prop = None
    def __init__(self, config, options=None):
        self.config = config
        self.options = {}
        if options:
            self.options.update(options)
    def ignore(self, name):
        return name.startswith('.')
    def collect(self, src_path, packages=None):
        xml_path = os.path.join(src_path, self.config.get(self.package_def_prop))
        packages = []
        xml = minidom.parseString(self.read(xml_path))
        for package_elem in xml.documentElement.getElementsByTagName('package'):
            package = {'name': package_elem.getAttribute('name'), 'files': []}
            for file_elem in package_elem.getElementsByTagName('file'):
                file_path = ''.join(t.nodeValue for t in file_elem.childNodes if t.nodeType == t.TEXT_NODE)
                if file_path.startswith('/'):
                    file_path = file_path[1:]
                package['files'].append(os.path.join(src_path, file_path))
            packages.append(package)
        return packages
    def assemble(self, package):
        logging.debug('Assembling package "%s"...' % package['name'])
        _, tmp_path = tempfile.mkstemp(suffix=self.suffix)
        tmp = self.open(tmp_path, mode='w')
        for p in package['files']:
            if os.path.exists(p):
                tmp.write('\n')
                tmp.write(self.read(p))
            else:
                msg = 'Could not find file: %s' % p
                logging.critical(msg)
                raise Exception(msg)
        tmp.close()
        return tmp_path
    def prepare_crunch_args(self, src_path, dst_path):
        raise Exception('Abstract')
    def postcrunch_filter(self, string):
        return string
    def no_crunch(self, src_path, dst_path):
        f = self.open(dst_path, mode='w+')
        legal = self.config.get_license()
        if legal:
            f.write('/*\n%s\n*/\n' % legal)
        data = self.read(src_path)
        f.write(data)
        f.close()
        return data
    def crunch(self, src_path, dst_path):
        args = self.prepare_crunch_args(src_path, dst_path)
        proc = subprocess.Popen(args, stdout=subprocess.PIPE)
        stdoutdata, stderrordata = proc.communicate()
        if proc.returncode != 0:
            msg = 'Compilation of %s failed.' % str(src_path)
            logging.critical(msg)
            raise Exception(msg)
        else:
            stdoutdata = self.postcrunch_filter(stdoutdata)
            f = self.open(dst_path, mode='w+')
            legal = self.config.get_license()
            if legal:
                f.write('/*\n%s\n*/\n' % legal)
            f.write(stdoutdata)
            f.close()
            return stdoutdata
    def get_dst_path(self, package_name):
        raise Exception('Abstract')
    def run(self, src_path, package, do_crunch):
        assembled_path = self.assemble(package)
        dst_path = self.get_dst_path(package['name'])
        dst_folder = os.path.dirname(dst_path)
        if not os.path.exists(dst_folder):
            os.makedirs(dst_folder)
        if do_crunch:
            package['code'] = self.crunch(assembled_path, dst_path)
        else:
            package['code'] = self.no_crunch(assembled_path, dst_path)
        os.remove(assembled_path)
        logging.debug('Finished compiling package "%s".' % package['name'])

class XmlConfigCompiler():
    
    def __init__(self):
        self.config = Config()
        self.index_page_path = self.config.get_index_page()
        self.index_page_string = self.read_index_page()
    
    def read_index_page(self):    
        with open(self.index_page_path, 'r') as f:
            index_html = f.read()
        return index_html
    
    def findPackages(self,pattern):
        package_list = []
        
        packages = re.findall(pattern,self.index_page_string, re.DOTALL)
        
        for package in packages:
            package_list.append(package)
        
        return package_list
    
    def write_css_config(self,package_manifest):
        package_def = self.config.get_css_package_def()
        
        with open(package_def, 'w') as f:
            f.write('<styles>\n')
            for item in package_manifest:
                f.write('\t<package name="%s">\n' % item)
                for script in package_manifest[item]:
                    f.write('\t\t<file>%s</file>\n' % script)
                f.write('\t</package>\n')
            f.write('</styles>\n')
    
    def write_js_config(self,package_manifest):
        package_def = self.config.get_js_package_def()
        
        with open(package_def, 'w') as f:
            f.write('<scripts>\n')
            for item in package_manifest:
                f.write('\t<package name="%s">\n' % item)
                for script in package_manifest[item]:
                    f.write('\t\t<file>%s</file>\n' % script)
                f.write('\t</package>\n')
            f.write('</scripts>\n')
    
    def build_css_package_manifest(self,package_list):
        package_manifest = {}
        for package_search in package_list:
            stylesheets = re.search('<!--css:'+package_search+'-->.*?<!--/css:'+package_search+'-->',self.index_page_string, re.DOTALL).group()
            files = []
            srcs = re.findall('href="(.*?)"',stylesheets)
            for src in srcs:
                files.append('/' + src)
            
            package_manifest[package_search] = files
            files = []
            
        return package_manifest
    
    def build_js_package_manifest(self,package_list):
        package_manifest = {}
        for package_search in package_list:
            scripts = re.search('<!--js:'+package_search+'-->.*?<!--/js:'+package_search+'-->',self.index_page_string, re.DOTALL).group()
            files = []
            srcs = re.findall('type="text/javascript" src="(.*?)"',scripts)
            for src in srcs:
                files.append('/' + src)
            
            package_manifest[package_search] = files
            files = []
            
        return package_manifest
    
    def generate_js_config_xml(self):
        msg = 'building js xml config...'
        print msg
        logging.info(msg)
        package_list = self.findPackages('<!--js:(.*?)-->')
        
        package_manifest = self.build_js_package_manifest(package_list)
        
        self.write_js_config(package_manifest)
        
            
    def generate_css_config_xml(self):
        msg = 'building css xml config...'
        print msg
        logging.info(msg)
        package_list = self.findPackages('<!--css:(.*?)-->')
        
        package_manifest = self.build_css_package_manifest(package_list)
            
        self.write_css_config(package_manifest)


class JSCompiler(PackageCompiler):
    suffix = '.js'
    package_def_prop = 'js_package_def'
    def get_dst_path(self, package_name):
        return self.config.get_js_dst_path(package_name)
    def prepare_crunch_args(self, src_path, dst_path):
        args = ['java', '-jar', 'libs/closure/compiler.jar', '--js', src_path]
        if self.options:
            for k, v in self.options.items():
                args += ['--%s' % k, v]
        return args

class CSSCompiler(PackageCompiler):
    vendors = ['webkit', 'moz', 'ms', 'o']
    suffix = '.css'
    package_def_prop = 'css_package_def'
    def get_dst_path(self, package_name):
        return self.config.get_css_dst_path(package_name)
    def prepare_crunch_args(self, src_path, dst_path):
        args = ['java', '-jar', 'libs/yui/yuicompressor-2.4.7.jar', '--type', 'css']
        for k, v in self.options.items():
            args += ['--%s' % k, v]
        args += [src_path]
        return args
    def postcrunch_filter(self, string):
        keep_vendors = self.config.get('css_vendors')
        if keep_vendors:
            for vendor in self.vendors:
                if not vendor in keep_vendors:
                    string = re.sub(r'(@-%s-keyframes[^\{]*\{from\{[^\}]*\}to\{[^\}]*\})\}|(-%s-[-\w]+\:[^;\{\}]*(;|(?=\})))|(\w+\:[^;]*-%s-[-\w]+\([^;]*(;|(?=\})))' % (vendor, vendor, vendor), '', string)
        return string

class TestGenerator(FileManager):
    def __init__(self, config):
        self.config = config
    def generate_test_page(self, test_html, subject_folder, out_path):
        scripts = []
        index_html = self.read(os.path.join(subject_folder, self.config.get('index_page')))
        for match in re.findall('<script type="text/javascript" src="[^"]*"></script>', index_html):
            match = re.sub('(<script type="text/javascript" src=")|("></script>)', '', match)
            scripts.append('<script type="text/javascript" src="../%s/%s"></script>' % (os.path.split(subject_folder)[1], match))
        out_html = re.sub('<!--generated:source-->.*<!--/generated:source-->', '\n'.join(scripts), test_html, flags=re.S)
        self.write(out_path, out_html)
        return "file://%s" % out_path
    def run(self, src_folder, dst_folder, test_folder):
        logging.debug('Generating test suite...')
        spec_folder = os.path.join(test_folder, 'unit')
        spec_files = os.listdir(spec_folder)
        unit_scripts = []
        f = open(os.path.join(test_folder, 'index.html'), 'r')
        test_html = f.read()
        f.close()
        for spec_file in spec_files:
            if spec_file.endswith('.js'):
                unit_scripts.append('<script type="text/javascript" src="unit/%s"></script>' % spec_file)
        test_html = re.sub('<!--generated:spec-->.*<!--/generated:spec-->', '\n'.join(unit_scripts), test_html, flags=re.S)
        if self.config.get('run_src_tests'):
            src_url = self.generate_test_page(test_html, src_folder, os.path.join(test_folder, "$src.html"))
            webbrowser.open_new(src_url)
        if self.config.get('run_dst_tests'):
            out_url = self.generate_test_page(test_html, dst_folder, os.path.join(test_folder, "$www.html"))
            webbrowser.open_new(out_url)

class DocGenerator(FileManager):
    def __init__(self, config):
        self.config = config
    def run(self, js_folder, docs_folder):
        logging.info('Generating JS documenation')
        sys.path.append('libs/atnotate')
        from atnotate import DocWriter
        DocWriter('libs/atnotate/templates').process_dir(js_folder, docs_folder)
        webbrowser.open_new('file:///%s' % os.path.join(docs_folder, 'index.html'))

class BaseBuilder(FileManager):
    def __init__(self):
        pass
    def reduce_to_relative(self, html_path, referenced_path):
        html_parts = html_path.split(os.sep)
        referenced_parts = referenced_path.split(os.sep)
        len_html = len(html_parts)
        len_ref = len(referenced_parts)
        for i in range(len_ref):
            html_part = html_parts[i] if i < len_html else None
            referenced_part = referenced_parts[i] if i < len_ref else None
            if html_part != referenced_part:
                return os.sep.join(referenced_parts[i:])
        return os.sep.join(referenced_path)

class CordovaBuilder(BaseBuilder):
    key = None
    icon_map = {
        }
    splash_map = {
        }
    def __init__(self, config):
        self.config = config
    def copy_mapped_images(self, mapped_images, src_folder, src_key, dst_key):
        dst_folder = self.config.get('%s_%s' % (self.key, dst_key))
        if os.path.exists(dst_folder):
            src_folder = os.path.join(src_folder, self.config.get(src_key))
            for src, dst in mapped_images.items():
                src = os.path.join(src_folder, src)
                if os.path.exists(src):
                    dst = os.path.join(dst_folder, dst)
                    shutil.copy(src, dst)
    def copy_icons(self, src_folder):
        self.copy_mapped_images(self.icon_map, src_folder, 'icon_src', 'icon_dst')
    def copy_splash(self, src_folder):
        self.copy_mapped_images(self.splash_map, src_folder, 'splash_src', 'splash_dst')
    def replace_cordova_tag(self, html_path):
        html = self.read(html_path)
        match = re.search('<!--cordova\:((\d\.?)+)-->', html)
        if match:
            version = match.group(1)
            cordova_file = 'libs/cordova/%s/cordova-%s%s.js' % (self.key, version, '.min' if self.config.get('compress_js') else '')
            if not os.path.exists(cordova_file):
                raise Exception('Cannot file Cordova script file: %s' % cordova_file)
            sub = ''
            if self.config.get('inline_js'):
                code = self.read(cordova_file)
                sub = '<script type="text/javascript">%s</script>' % code
            else:
                js_path = os.path.join(self.config.get_cordova_dst_folder(self.key), self.config.get('js_dst'), os.path.basename(cordova_file))
                shutil.copy(cordova_file, js_path)
                js_href = self.reduce_to_relative(html_path, js_path)
                sub = '<script type="text/javascript" src="%s"></script>' % js_href
            html = sub.join(re.split('<!--cordova\:(?:\d\.?)+-->', html))
            self.write(html_path, html)
    def run(self):
        dst = self.config.get_dst_folder()
        cdv_dst = self.config.get_cordova_dst_folder(self.key)
        if os.path.exists(cdv_dst):
            names = os.listdir(cdv_dst)
            for name in names:
                if not name.startswith('.'):
                    name = os.path.join(cdv_dst, name)
                    if os.path.isfile(name):
                        os.remove(name)
                    else:
                        shutil.rmtree(name)
        names = os.listdir(dst)
        for name in names:
            if not name.startswith('.'):
                src = os.path.join(dst, name)
                copy = os.path.join(cdv_dst, name)
                if os.path.isfile(src):
                    shutil.copy(src, copy)
                else:
                    shutil.copytree(src, copy, ignore=shutil.ignore_patterns('.*'))
        for r, d, f in os.walk(cdv_dst):
            for files in filter(lambda x: x.endswith('.html'), f):
                p = os.path.join(r, files)
                self.replace_cordova_tag(p)
        self.copy_icons(dst)
        self.copy_splash(dst)

class IOSBuilder(CordovaBuilder):
    key = 'ios'
    icon_map = {
        'icon-57x57.png': 'icon.png',
        'icon-72x72.png': 'icon-72.png',
        'icon-114x114.png': 'icon@2x.png',
        'icon-144x144.png': 'icon-72@2x.png'
        }
    splash_map = {
        'splash-320x480.png': 'Default.png',
        'splash-640x960.png': 'Default@2x.png',
        'splash-768x1004.png': 'Default-Portrait.png',
        'splash-1536x2008.png': 'Default-Portrait@2x.png',
        'splash-1024x748.png': 'Default-Landscape.png',
        'splash-2048x1496.png': 'Default-Landscape@2x.png'
        }

class AndroidBuilder(CordovaBuilder):
    key = 'android'
    icon_map = {
        'icon-36x36.png': 'drawable-ldpi/ic_launcher.png',
        'icon-48x48.png': 'drawable-mdpi/ic_launcher.png',
        'icon-72x72.png': 'drawable-hdpi/ic_launcher.png',
        'icon-96x96.png': 'drawable-xhdpi/ic_launcher.png'
        }
    def copy_splash(self, src_folder):
        # Android does not support splash screens
        pass

class Builder(BaseBuilder):
    def __init__(self):
        self.config = Config()
        self.xml_config_compiler = XmlConfigCompiler()
        self.xml_config_compiler.generate_js_config_xml()
        self.xml_config_compiler.generate_css_config_xml()
        self.js_compiler = JSCompiler(self.config)
        self.css_compiler = CSSCompiler(self.config)
        self.test_generator = TestGenerator(self.config)
        self.doc_generator = DocGenerator(self.config)
    def get_target_config(self, html, target):
        scripts = re.findall('<script[^>]+type="text/x-config"[^>]+>.*?</script>', html)
        for script in scripts:
            name = re.findall('<script[^>]+data-name="(.*?)"[^>]*>', script)[0]
            if name == target:
                src = re.findall('data-src="(.*?)"', script)
                code = re.findall('<script.*?>(.*?)</script>', script)
                if src:
                    src = src[0]
                if code:
                    code = code[0]
                return {
                    'name': name,
                    'src': src,
                    'code': code
                }
        return None
    def copy(self, src_folder, src_name, dst_folder, js_packages, css_packages):
        if not src_name.startswith('.'):
            src = os.path.join(src_folder, src_name)
            dst = os.path.join(dst_folder, src_name)
            if os.path.isdir(src):
                if src_name == 'img':
                    logging.debug('Deploying img...')
                    shutil.copytree(src, dst, ignore=shutil.ignore_patterns(".*"))
                else:
                    if not os.path.isdir(dst):
                        os.makedirs(dst)
                    for item in os.listdir(src):
                        self.copy(src, item, dst, js_packages, css_packages)
            elif os.path.splitext(src_name)[1] == '.html':
                logging.debug('Processing %s...' % src_name)
                html = self.read(src)
                if self.config.get('compress_html'):
                    html = re.sub('\s+', ' ', html)
                html = re.sub('<!--debug-->.*<!--/debug-->', '', html)
                if self.config.get('combine_js'):
                    for package in js_packages:
                        package_name = package['name']
                        package_path = self.reduce_to_relative(dst_folder, self.config.get_js_dst_path(package_name))
                        sub = '<script type="text/javascript" src="%s"></script>' % package_path
                        if self.config.get('inline_js'):
                            sub = '<script type="text/javascript">%s</script>' % package['code']
                        html = sub.join(re.split('<!--js:%(name)s-->.*<!--/js:%(name)s-->' % {'name': package_name}, html))
                if self.config.get('combine_css'):
                    for package in css_packages:
                        package_name = package['name']
                        package_path = self.reduce_to_relative(dst_folder, self.config.get_css_dst_path(package_name))
                        sub = '<link rel="stylesheet" href="%s">' % package_path
                        if self.config.get('inline_css'):
                            sub = '<style type="text/css">%s</style>' % package['code']
                        html = sub.join(re.split('<!--css:%(name)s-->.*<!--/css:%(name)s-->' % {'name': package_name}, html))
                if self.config.get('target_js_config_only'):
                    target_config = self.get_target_config(html, self.config.get('target'))
                    if target_config:
                        script = '<script type="text/x-config" data-name="%s" data-default>' % target_config['name']
                        if target_config['src']:
                            cf = open(os.path.join(os.path.dirname(src), target_config['src']), 'r')
                            target_config['code'] = cf.read()
                            cf.close();
                        html = (script + re.sub('\s+', ' ', target_config['code']) + '</script>').join(re.split('<!--Lavaca:configs-->.*?<!--/Lavaca:configs-->', html))
                if self.config.get('remove_comments'):
                    html = re.sub('<!--(?!cordova\:)(.*?)-->', '', html)
                logging.debug('Deploying %s...' % src_name)
                self.write(dst, html)
            else:
                logging.debug('Deploying %s...' % src_name)
                shutil.copyfile(src, dst)
    def run(self):
        logging.basicConfig(filename=self.config.get('log_file'), level=getattr(logging, self.config.get('log_level')))
        start = datetime.datetime.now()
        msg = 'Starting %s build at %s...' % (self.config.get('target'), start)
        print msg
        logging.info(msg)
        logging.debug('Creating deploy folder...')
        src_folder = self.config.get_src_folder()
        dst_folder = self.config.get_dst_folder()
        if os.path.exists(dst_folder):
            shutil.rmtree(dst_folder)
        os.makedirs(dst_folder)
        js_packages, css_packages = [], []
        if self.config.get('combine_js'):
            logging.debug('Collecting JavaScript packages...')
            js_packages = self.js_compiler.collect(src_folder)
            for package in js_packages:
                self.js_compiler.run(dst_folder, package, self.config.get('compress_js'))
            if self.config.get('inline_js'):
                shutil.rmtree(self.config.get_js_dst_folder())
        if self.config.get('combine_css'):
            logging.debug('Collecting CSS packages...')
            css_packages = self.css_compiler.collect(src_folder)
            for package in css_packages:
                self.css_compiler.run(dst_folder, package, self.config.get('compress_css'))
            if self.config.get('inline_css'):
                shutil.rmtree(self.config.get_css_dst_folder())
        for name in os.listdir(src_folder):
            if (name != 'js' or not self.config.get('combine_js')) and (name != 'css' or not self.config.get('combine_css')) and (name !='configs' or not self.config.get('target_js_config_only')) and name != self.config.get('css_package_def') and name != self.config.get('js_package_def'):
                self.copy(src_folder, name, dst_folder, js_packages, css_packages)
        msg = 'Build completed in %.2f seconds.' % (datetime.datetime.now() - start).total_seconds()
        logging.info(msg)
        print msg
        if self.config.get('run_src_tests') or self.config.get('run_dst_tests'):
            msg = 'Running tests...'
            logging.info(msg)
            self.test_generator.run(src_folder, dst_folder, self.config.get_test_dst_folder())
        if self.config.get('run_doc'):
            msg = 'Generating docs...'
            logging.info(msg)
            self.doc_generator.run(self.config.get_js_src_folder(), self.config.get_doc_dst_folder())
        if self.config.get('ios'):
            ios_builder = IOSBuilder(self.config)
            ios_builder.run()
        if self.config.get('android'):
            android_builder = AndroidBuilder(self.config)
            android_builder.run()

def usage():
    print 'Mutual Mobile HTML Boilerplate Build Script'
    print 'Usage:'
    print '-h, --help: Show options'
    print '-c file, --config=file: Use a specified file for building the project (instead of the default)'
    print '-t name, --target=name: Set the build target to be a different environment'

if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'hc:t:', ['help', 'config=', 'target='])
    except getopt.GetoptError, err:
        print str(err)
        usage()
        sys.exit(2)
    overrides = {}
    for o, a in opts:
        if o in ('-h', '--help'):
            usage()
            sys.exit(1)
        if o in ('-c', '--config'):
            overrides['config_file'] = a
        if o in ('-t', '--target'):
            overrides['target'] = a
    builder = Builder()
    if overrides:
        for k, v in overrides.items():
            builder.config.override(k, v)
    
    
    builder.config.load()
    builder.run()

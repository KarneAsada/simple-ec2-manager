Simple EC2 Manager
==================

Each member of my dev team has their own ec2 instance to use as a staging server during devlopment.  We needed an easy way to start and stop instances, since it was wasteful to run them 24/7.  I built this web app to provide a super, simple way to manage the instances with one click.  This way we don't have to deal with the AWS console everytime someone wants to start up their instance, and potentially accidentally stop one of our production servers.

## Installation

* Add your AWS key and secret to the `$credentials` array in `ajax.php`
* Create a `nickname:instance-id` pair for every instance you want to control in `conf.json`
* Copy the files to your webserver and run!

**Simple, right?!**

## Ingredients

I built this using:
* [AWS SDK For PHP 1.x](https://github.com/amazonwebservices/aws-sdk-for-php)
* [Ember](http://emberjs.com/)
* [jQuery](http://jquery.com/)
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/)